import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ratingsApi } from "@/lib/api";

interface RatingModalProps {
  donationId: string;
  toUser: string;
  toUserName: string;
  onClose: () => void;
}

const RatingModal = ({ donationId, toUser, toUserName, onClose }: RatingModalProps) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => ratingsApi.submit({ donationId, toUser, rating, feedback }),
    onSuccess: () => {
      toast.success("Rating submitted!");
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to submit rating"),
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-foreground mb-1">Rate Your Experience</h2>
        <p className="text-sm text-muted-foreground mb-6">
          How would you rate your interaction with <strong>{toUserName}</strong>?
        </p>

        {/* Star Rating */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hovered || rating)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm font-medium text-primary mb-4">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </p>
        )}

        {/* Feedback */}
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Optional feedback..."
          rows={3}
          className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-6"
        />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={rating === 0 || isPending}
            onClick={() => mutate()}
          >
            {isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
