import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '@/lib/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/sonner';
import { AlertCircle } from 'lucide-react';

interface ReportDisputeButtonProps {
  deliveryId: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export function ReportDisputeButton({ deliveryId, variant = 'outline' }: ReportDisputeButtonProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: () => disputesApi.create(deliveryId, category, description),
    onSuccess: () => {
      toast.success('Dispute reported successfully');
      setOpen(false);
      setCategory('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to report dispute'),
  });

  const handleSubmit = () => {
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Please provide a detailed description (minimum 10 characters)');
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Delivery Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="category">Issue Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
                <SelectItem value="LATE_PICKUP">Late Pickup</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={reportMutation.isPending}>
              {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
