
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActivityContent = (activity: any) => {
    switch (activity.activity_type) {
      case 'grammar':
        return (
          <div className="space-y-2">
            <h3 className="font-semibold">Grammar Quiz</h3>
            <p className="text-sm text-muted-foreground">
              Score: {activity.content.score}/{activity.content.total}
            </p>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate(`/grammar/review/${activity.id}`)}
            >
              Review Quiz
            </Button>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">{JSON.stringify(activity.content)}</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Activity History</h1>
        <p className="text-muted-foreground mt-2">Review your past activities and progress.</p>
      </div>

      <div className="grid gap-4">
        {activities.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No activities found. Start learning to see your progress!
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                  {renderActivityContent(activity)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
