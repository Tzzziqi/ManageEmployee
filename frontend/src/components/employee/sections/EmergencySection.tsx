// Emergency contact component: display and edit emergency contacts, save to backend
import { useForm, useFieldArray } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateEmergencyContact } from '../../../store/slices/profileSlice';
import type { RootState, AppDispatch } from '../../../store/store';
import SectionCard from '../SectionCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface EmergencyContact {
  firstName:    string;
  lastName:     string;
  middleName:   string;
  phone:        string;
  email:        string;
  relationship: string;
}
interface FormValues {
  emergencyContacts: EmergencyContact[];
}


const emptyContact = {
  firstName: '', lastName: '', middleName: '',
  phone: '', email: '', relationship: ''
};

const EmergencySection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((s: RootState) => s.profile.data);

  const defaultValues = {
    emergencyContacts: data?.emergencyContacts?.length > 0
      ? data.emergencyContacts
      : [emptyContact]
  };

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({ defaultValues });

  // useFieldArray: manage dynamic list of emergency contacts
  const { fields, append, remove } = useFieldArray({ control, name: 'emergencyContacts' });

  const handleStartEdit = () => reset(defaultValues);

  const handleSave = handleSubmit(async (formData) => {
    try {
      await dispatch(updateEmergencyContact(formData)).unwrap();
      toast.success('Emergency contacts updated!');
    } catch (error: any) {
      toast.error(error || 'Failed to update emergency contacts');
      throw error;
    }
  });

  const handleDiscard = () => reset(defaultValues);

  //==== Render
  return (
    <SectionCard title="Emergency Contact" onSave={handleSave} onDiscard={handleDiscard} onStartEdit={handleStartEdit}>
      {({ isEditing }: { isEditing: boolean }) => (
        isEditing ? (
          <div className="flex flex-col gap-5">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-gray-700">Contact {index + 1}</p>
                  {/* doc requires 1+ contacts, so only show remove if more than 1 */}
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm"
                      className="text-red-500 text-xs hover:text-red-700"
                      onClick={() => remove(index)}>
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input {...register(`emergencyContacts.${index}.firstName`, { required: 'Required' })} />
                    {errors.emergencyContacts?.[index]?.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.emergencyContacts[index]?.firstName?.message ?? '')}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input {...register(`emergencyContacts.${index}.lastName`, { required: 'Required' })} />
                    {errors.emergencyContacts?.[index]?.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.emergencyContacts[index]?.lastName?.message ?? '')}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Middle Name</Label>
                    <Input {...register(`emergencyContacts.${index}.middleName`)} />
                  </div>
                  <div>
                    <Label>Relationship *</Label>
                    <Input
                      {...register(`emergencyContacts.${index}.relationship`, { required: 'Required' })}
                      placeholder="e.g. Spouse, Parent, Friend"
                    />
                    {errors.emergencyContacts?.[index]?.relationship && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.emergencyContacts[index]?.relationship?.message ?? '')}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input {...register(`emergencyContacts.${index}.phone`, { required: 'Required' })} />
                    {errors.emergencyContacts?.[index]?.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.emergencyContacts[index]?.phone?.message ?? '')}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input {...register(`emergencyContacts.${index}.email`)} />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => append(emptyContact)}
            >
              + Add Another Contact
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data?.emergencyContacts?.length > 0 ? (
              data.emergencyContacts.map((c: any, i: number) => (
                <div key={i} className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Name</p>
                    <p className="text-sm text-gray-800 mt-0.5">
                      {[c.firstName, c.middleName, c.lastName].filter(Boolean).join(' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                    <p className="text-sm text-gray-800 mt-0.5">{c.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Relationship</p>
                    <p className="text-sm text-gray-800 mt-0.5">{c.relationship || '—'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No emergency contacts added.</p>
            )}
          </div>
        )
      )}
    </SectionCard>
  );
};

export default EmergencySection;