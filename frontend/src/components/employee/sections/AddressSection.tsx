// Address component: display and edit addrss form, save to backend
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateAddress } from '../../../store/slices/profileSlice';
import type { RootState, AppDispatch } from '../../../store/store';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';


const AddressSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rawAddress = useSelector((s: RootState) => s.profile.data?.address);

  const address = useMemo(() => ({
    street: rawAddress?.street ?? '',
    city:   rawAddress?.city   ?? '',
    state:  rawAddress?.state  ?? '',
    zip:    rawAddress?.zip    ?? '',
  }), [rawAddress?.street, rawAddress?.city, rawAddress?.state, rawAddress?.zip]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: address,
  });

  useEffect(() => {
    reset(address);
  }, [address]);

  const handleStartEdit = () => reset(address);
  const handleDiscard  = () => reset(address);
  const handleSave = handleSubmit(async (formData) => {
      try {
          // .unwrap() key for createAsyncThunk. withoutit, even rejected, promise witll not reject and catch will not execute 
          await dispatch(updateAddress(formData)).unwrap(); 
          toast.success('Address updated!');
      } catch(error: any) {
          toast.error(error || 'Failed to update address');
          throw error; // let sectioncard know failed to save and do not close editing modle
      }
        },
          (errors) => {
            throw new Error('Validation failed'); 
          }
        );


  //==== Render
  return(
    <SectionCard title="Address" onSave={handleSave} onDiscard={handleDiscard} onStartEdit={handleStartEdit}>
        {({ isEditing }: { isEditing: boolean }) => (isEditing ? (
            <div className="grid gap-4">
            <div>
              <Label>Street *</Label>
              <Input {...register('street', { required: 'Street is required' })} />
              {errors.street && <p className="text-red-500 text-xs mt-1">{String(errors.street.message ?? '')}</p>}

            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>City *</Label>
                <Input {...register('city', { required: 'City is required' })} />
                {errors.city && <p className="text-red-500 text-xs mt-1">{String(errors.city.message ?? '')}</p>}

              </div>
              <div>
                <Label>State *</Label>
                <Input {...register('state', { required: 'State is required' })} />
              </div>
              <div>
                <Label>Zip *</Label>
                <Input {...register('zip', { required: 'Zip is required' })} />
              </div>
            </div>
          </div>

          ) : (
            <div className="grid grid-cols-2 gap-4">
            {(['street', 'city', 'state', 'zip'] as const).map(f => (
              <div key={f}>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{f}</p>
                <p className="text-sm text-gray-800 mt-0.5">{address[f] || '—'}</p>
              </div>
            ))}
          </div>
        )
      )}
    </SectionCard>
  );
};


export default AddressSection;