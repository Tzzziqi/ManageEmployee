// Contact component: display and edit contact info, save to backend
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
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
    mobile: data?.phone?.mobile ?? '',
    work: data?.phone?.work ?? '',
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });
  
  useEffect(() => {
    reset({
      mobile: data?.phone?.mobile ?? '',
      work:   data?.phone?.work   ?? '',
    });
  }, [data?.phone]);

  const handleStartEdit = () => reset({
    mobile: data?.phone?.mobile ?? '',
    work: data?.phone?.work ?? '',
  });

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
              <Label>Mobile Phone *</Label>
              <Input
                {...register('mobile', {
                  required: 'Mobile phone is required',
                  pattern: {
                    value: /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
                    message: 'Invalid phone number format'
                  }
                })}
                placeholder="(949) 555-0182"
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{String(errors.mobile.message ?? '')}</p>}
            </div>
            <div>
              <Label>Work Phone</Label>
              <Input {...register('work')} placeholder="Optional" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Mobile Phone</p>
              <p className="text-sm text-gray-800 mt-0.5">{data?.phone?.mobile || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Work Phone</p>
              <p className="text-sm text-gray-800 mt-0.5">{data?.phone?.work || '—'}</p>
            </div>
          </div>
        )
      )}
    </SectionCard>
  );
};

export default ContactSection;