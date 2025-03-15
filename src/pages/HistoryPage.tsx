
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
            <p>Score: {activity.content.score}/{activity.content.total}</p>
            <Button onClick={() => navigate(`/grammar/review/${activity.id}`)}>
              Review Quiz
            </Button>
          </div>
        );
      // Add other activity types here
      default:
        return <p>{JSON.stringify(activity.content)}</p>;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Activity History</h1>
      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
                {renderActivityContent(activity)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
