// Employment component: display and edit visa/employment info, save to backend
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateEmployment } from '../../../store/slices/profileSlice';
import type { RootState, AppDispatch } from '../../../store/store';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

const EmploymentSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((s: RootState) => s.profile.data);

  // visaTitle display first and then residentType，then visaType
  const resolvedVisaTitle = data?.workAuthorization || data?.workAuthorizationDetail?.workAuthType || '';

  const defaultValues = {
    visaStartDate: data?.visaStartDate ? data.visaStartDate.slice(0, 10) : '',
    visaEndDate:   data?.visaEndDate   ? data.visaEndDate.slice(0, 10)   : '',
  };

  const { register, handleSubmit, reset } = useForm({ defaultValues });
  useEffect(() => {
  reset({
    visaStartDate: data?.visaStartDate ? data.visaStartDate.slice(0, 10) : '',
    visaEndDate:   data?.visaEndDate   ? data.visaEndDate.slice(0, 10)   : '',
  });
}, [data?.visaStartDate, data?.visaEndDate]);

  const handleStartEdit = () => reset(defaultValues);

  const handleSave = handleSubmit(async (formData) => {
    try {
      await dispatch(updateEmployment(formData)).unwrap();
      toast.success('Employment info updated!');
    } catch (error: any) {
      toast.error(error || 'Failed to update employment info');
      throw error;
    }
  });

  const handleDiscard = () => reset(defaultValues);

  //==== Render
  return (
    <SectionCard title="Employment" onSave={handleSave} onDiscard={handleDiscard} onStartEdit={handleStartEdit}>
      {({ isEditing }: { isEditing: boolean }) => (
        isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Visa Title</Label>
              <Input value={resolvedVisaTitle} disabled placeholder="e.g. F1 OPT, H1-B" />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" {...register('visaStartDate')} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" {...register('visaEndDate')} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Visa Title</p>
              <p className="text-sm text-gray-800 mt-0.5">{resolvedVisaTitle || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Start Date</p>
              <p className="text-sm text-gray-800 mt-0.5">{data?.visaStartDate?.slice(0, 10) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">End Date</p>
              <p className="text-sm text-gray-800 mt-0.5">{data?.visaEndDate?.slice(0, 10) || '—'}</p>
            </div>
          </div>
        )
      )}
    </SectionCard>
  );
};

export default EmploymentSection;