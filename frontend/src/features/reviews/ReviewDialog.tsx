import { useState } from 'react';
import { Button, Modal, Textarea } from '@/shared/ui';
import { RatingInput } from '@/shared/ui/RatingStars';
import { FormError } from '@/shared/ui/FormError';
import { ApiError } from '@/shared/api/errors';
import { useCreateReview } from './hooks';

interface ReviewDialogProps {
  bookingId: number | null;
  teacherName?: string;
  onClose: () => void;
}

export function ReviewDialog({ bookingId, teacherName, onClose }: ReviewDialogProps) {
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (bookingId === null) return;
    setError(null);
    try {
      await createReview.mutateAsync({ booking_id: bookingId, rating, comment });
      setComment('');
      setRating(5);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your review.');
    }
  };

  return (
    <Modal
      open={bookingId !== null}
      onClose={onClose}
      title="Leave a review"
      description={teacherName ? `Share your experience with ${teacherName}.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createReview.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} loading={createReview.isPending}>
            Submit review
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormError message={error} />
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Your rating</p>
          <RatingInput value={rating} onChange={setRating} />
        </div>
        <Textarea
          label="Comment (optional)"
          placeholder="What did you enjoy about the lesson?"
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
}
