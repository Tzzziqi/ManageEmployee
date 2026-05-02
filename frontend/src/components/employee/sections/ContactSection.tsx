// Contact component: display and edit contact info, save to backend
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateContact } from '../../../store/slices/profileSlice';
import type { RootState, AppDispatch } from '../../../store/store';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

const ContactSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((s: RootState) => s.profile.data);

  const defaultValues = {
    cellPhone: data?.cellPhone ?? '',
    workPhone: data?.workPhone ?? '',
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  const handleStartEdit = () => reset(defaultValues);

  const handleSave = handleSubmit(async (formData) => {
    try {
      await dispatch(updateContact(formData)).unwrap();
      toast.success('Contact info updated!');
    } catch (error: any) {
      toast.error(error || 'Failed to update contact info');
      throw error;
    }
  });

  const handleDiscard = () => reset(defaultValues);

  //==== Render
  return (
    <SectionCard title="Contact Info" onSave={handleSave} onDiscard={handleDiscard} onStartEdit={handleStartEdit}>
      {({ isEditing }: { isEditing: boolean }) => (
        isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cell Phone *</Label>
              <Input
                {...register('cellPhone', {
                  required: 'Cell phone is required',
                  pattern: {
                    value: /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
                    message: 'Invalid phone number format'
                  }
                })}
                placeholder="(949) 555-0182"
              />
              {errors.cellPhone && <p className="text-red-500 text-xs mt-1">{String(errors.cellPhone.message ?? '')}</p>}
            </div>
            <div>
              <Label>Work Phone</Label>
              <Input {...register('workPhone')} placeholder="Optional" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Cell Phone</p>
              <p className="text-sm text-gray-800 mt-0.5">{data?.cellPhone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Work Phone</p>
              <p className="text-sm text-gray-800 mt-0.5">{data?.workPhone || '—'}</p>
            </div>
          </div>
        )
      )}
    </SectionCard>
  );
};

export default ContactSection;