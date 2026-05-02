// Name component: display and edit name form, save to backend
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateName } from '../../../store/slices/profileSlice';
import type { RootState, AppDispatch } from '../../../store/store';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

const NameSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((s: RootState) => s.profile.data);

  const defaultValues = {
    firstName:    data?.firstName    ?? '',
    lastName:     data?.lastName     ?? '',
    middleName:   data?.middleName   ?? '',
    preferredName: data?.preferredName ?? '',
    ssn:          data?.ssn          ?? '',
    dateOfBirth:  data?.dateOfBirth  ? data.dateOfBirth.slice(0, 10) : '',
    gender:       data?.gender       ?? '',
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({ defaultValues });

  const handleStartEdit = () => reset(defaultValues);

  const handleSave = handleSubmit(async (formData) => {
    console.log('✅ handleSubmit dispactched,data is：', formData); 
    try {
      await dispatch(updateName(formData)).unwrap();
      toast.success('Name updated!');
    } catch (error: any) {
      toast.error(error || 'Failed to update name');
      throw error;
    }
    },
    (errors) => {
      console.log('❌ fail to validate：', errors);  
    }
  );

  const handleDiscard = () => reset(defaultValues);

  //==== Render
  return (
    <SectionCard title="Name" onSave={handleSave} onDiscard={handleDiscard} onStartEdit={handleStartEdit}>
      {({ isEditing }: { isEditing: boolean }) => (
        isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input {...register('firstName', { required: 'First name is required' })} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{String(errors.firstName.message ?? '')}</p>}
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input {...register('lastName', { required: 'Last name is required' })} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{String(errors.lastName.message ?? '')}</p>}
            </div>
            <div>
              <Label>Middle Name</Label>
              <Input {...register('middleName')} />
            </div>
            <div>
              <Label>Preferred Name</Label>
              <Input {...register('preferredName')} />
            </div>
            <div>
              <Label>SSN *</Label>
              <Input {...register('ssn')} placeholder="XXX-XX-XXXX" />
              {errors.ssn && <p className="text-red-500 text-xs mt-1">{String(errors.ssn.message ?? '')}</p>}
            </div>
            <div>
              <Label>Date of Birth *</Label>
              <Input type="date" {...register('dateOfBirth', { required: 'Date of birth is required' })} />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{String(errors.dateOfBirth.message ?? '')}</p>}
            </div>
            <div>
              <Label>Gender *</Label>
              <Select onValueChange={val => setValue('gender', val)} defaultValue={watch('gender')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="no_answer">I do not wish to answer</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{String(errors.gender.message ?? '')}</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name',     value: data?.firstName },
              { label: 'Last Name',      value: data?.lastName },
              { label: 'Middle Name',    value: data?.middleName },
              { label: 'Preferred Name', value: data?.preferredName },
              { label: 'SSN',            value: data?.ssn },
              { label: 'Date of Birth',  value: data?.dateOfBirth?.slice(0, 10) },
              { label: 'Gender',         value: data?.gender },
              { label: 'Email',          value: data?.email },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-800 mt-0.5">{value || '—'}</p>
              </div>
            ))}
          </div>
        )
      )}
    </SectionCard>
  );
};

export default NameSection;