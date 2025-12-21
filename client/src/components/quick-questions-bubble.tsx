import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircleQuestion, X, Send, ChevronUp, ChevronDown } from 'lucide-react';
import type { QuickQuestion } from '@shared/schema';

export default function QuickQuestionsBubble() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showAnswered, setShowAnswered] = useState(false);
  const [question, setQuestion] = useState('');
  const [askerName, setAskerName] = useState('');

  const { data: positionSetting } = useQuery<{ key: string; value: string | null }>({
    queryKey: ['/api/settings/quickQuestionsPosition'],
  });

  const position = positionSetting?.value || 'left';

  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'right-6 left-auto';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      case 'left':
      default:
        return 'left-6';
    }
  };

  const { data: answeredQuestions = [], isLoading } = useQuery<QuickQuestion[]>({
    queryKey: ['/api/quick-questions/answered'],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { question: string; questionEn?: string; askerName?: string }) => {
      return apiRequest('POST', '/api/quick-questions', data);
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم إرسال سؤالك' : 'Question Submitted',
        description: language === 'ar' 
          ? 'سيتم الرد على سؤالك في أقرب وقت' 
          : 'Your question will be answered soon',
      });
      setQuestion('');
      setAskerName('');
      queryClient.invalidateQueries({ queryKey: ['/api/quick-questions'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'لم يتم إرسال سؤالك، حاول مرة أخرى' 
          : 'Failed to submit question, please try again',
        variant: 'destructive',
      });
    },
  });

  const isArabicText = (text: string): boolean => {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicPattern.test(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const trimmedQuestion = question.trim();
    const isArabic = isArabicText(trimmedQuestion);
    
    submitMutation.mutate({
      question: isArabic ? trimmedQuestion : '',
      questionEn: isArabic ? undefined : trimmedQuestion,
      askerName: askerName.trim() || undefined,
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 md:bottom-6 ${getPositionClasses()} z-40 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2`}
          data-testid="button-open-quick-questions"
        >
          <MessageCircleQuestion className="w-6 h-6" />
          <span className="hidden md:inline font-medium">
            {language === 'ar' ? 'أسئلة سريعة' : 'Quick Questions'}
          </span>
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-20 md:bottom-6 ${getPositionClasses()} z-40 w-[350px] max-w-[calc(100vw-48px)]`}>
          <Card className="shadow-2xl border-2 border-green-200 dark:border-green-800">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircleQuestion className="w-5 h-5" />
                  {language === 'ar' ? 'أسئلة سريعة' : 'Quick Questions'}
                </CardTitle>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="button-close-quick-questions"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Input
                    placeholder={language === 'ar' ? 'اسمك (اختياري)' : 'Your name (optional)'}
                    value={askerName}
                    onChange={(e) => setAskerName(e.target.value)}
                    className="text-sm"
                    data-testid="input-asker-name"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Write your question here...'}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                    data-testid="input-question"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!question.trim() || submitMutation.isPending}
                  data-testid="button-submit-question"
                >
                  <Send className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {submitMutation.isPending 
                    ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                    : (language === 'ar' ? 'إرسال السؤال' : 'Submit Question')}
                </Button>
              </form>

              <div className="border-t pt-3">
                <button
                  onClick={() => setShowAnswered(!showAnswered)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  data-testid="button-toggle-answered"
                >
                  <span className="flex items-center gap-2">
                    {language === 'ar' ? 'الأسئلة المجابة' : 'Answered Questions'}
                    <Badge variant="secondary" className="text-xs">
                      {answeredQuestions.length}
                    </Badge>
                  </span>
                  {showAnswered ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAnswered && (
                  <ScrollArea className="h-48 mt-3">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full" />
                      </div>
                    ) : answeredQuestions.length === 0 ? (
                      <p className="text-center text-gray-500 py-4 text-sm">
                        {language === 'ar' ? 'لا توجد أسئلة مجابة حتى الآن' : 'No answered questions yet'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {answeredQuestions.map((q) => {
                          const displayQuestion = language === 'en' 
                            ? (q.questionEn || q.question) 
                            : (q.question || q.questionEn);
                          const displayAnswer = language === 'en' 
                            ? (q.answerEn || q.answer) 
                            : (q.answer || q.answerEn);
                          return (
                            <div
                              key={q.id}
                              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm"
                              data-testid={`answered-question-${q.id}`}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-green-600 font-bold">{language === 'ar' ? 'س:' : 'Q:'}</span>
                                <p className="text-gray-700 dark:text-gray-300">{displayQuestion}</p>
                              </div>
                              <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 rounded p-2">
                                <span className="text-green-700 dark:text-green-400 font-bold">{language === 'ar' ? 'ج:' : 'A:'}</span>
                                <p className="text-gray-700 dark:text-gray-300">{displayAnswer}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                {q.askerName && <span>{q.askerName}</span>}
                                <span>{formatDate(q.answeredAt)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
