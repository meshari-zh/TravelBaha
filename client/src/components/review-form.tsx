import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { insertReviewSchema } from "@shared/schema";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "يرجى اختيار تقييم").max(5, "التقييم الأقصى 5 نجوم"),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  bookingId: string;
  guideId: string;
  guideName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ bookingId, guideId, guideName, onSuccess, onCancel }: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => 
      apiRequest("/api/reviews", "POST", {
        bookingId,
        guideId,
        rating: data.rating,
        comment: data.comment,
      }),
    onSuccess: () => {
      toast({
        title: "تم إرسال التقييم!",
        description: "شكراً لك على تقييم تجربتك مع المرشد",
      });
      form.reset();
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/guide", guideId] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال التقييم",
        description: error.message || "حدث خطأ أثناء إرسال التقييم",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    if (rating === 0) {
      form.setError("rating", { message: "يرجى اختيار تقييم" });
      return;
    }
    reviewMutation.mutate({ ...data, rating });
  };

  const handleStarClick = (value: number) => {
    setRating(value);
    form.setValue("rating", value);
    form.clearErrors("rating");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">تقييم المرشد</CardTitle>
        <p className="text-sm text-muted-foreground">
          تقييم تجربتك مع {guideName}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Star Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={() => (
                <FormItem>
                  <FormLabel>التقييم</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className="focus:outline-none"
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleStarClick(value)}
                          data-testid={`star-${value}`}
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              value <= (hoverRating || rating)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      {rating > 0 && (
                        <span className="mr-2 text-sm font-medium">
                          ({rating}/5)
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التعليق (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="شاركنا تجربتك مع المرشد..."
                      className="resize-none"
                      rows={4}
                      data-testid="input-comment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={reviewMutation.isPending}
                data-testid="button-submit-review"
              >
                {reviewMutation.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancel}
                  data-testid="button-cancel-review"
                >
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}