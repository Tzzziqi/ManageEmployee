//=== resuaable componet: Manages isEditing state, renders Edit/Save/Cancel buttons, handles the cancel confirmation dialog.
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'; // Shadcn/ui

interface SectionCardProps {
    title: string;
    onSave: () => Promise<void>;
    onDiscard: () => void; // cancle 
    onStartEdit?: () => void; 
    children: (props: { isEditing: boolean }) => React.ReactNode // need to accept render props
    readOnly ?: boolean;
}

// Component for each section
const SectionCard = ({ title, onSave, onDiscard, onStartEdit, children, readOnly }: SectionCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try{
            await onSave();
            setIsEditing(false);
        // use finally not inside try: onSave() fails (API error), catch handles it, but saving must alwaus be reset.
        } finally {
            setSaving(false);
        }
    };
    
    const handleConfirmDiscard = () => {
        onDiscard();
        setIsEditing(false);
        setShowAlert(false);

        };

//====Render
return (
    <>
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className= "text-base font-semibold text-gray-800">{title}</h3>
            {/* readOnly === true, no render */}
            {!readOnly && (
            isEditing ? (
                // editing mode: show Save/Cancel buttons
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAlert(true)}>Cancel</Button> {/*show popup to ensure cancel.*/}
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>       
                </div>
                ) : (
                    <>
                    {/* Editing model: show edit button */}
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); onStartEdit?.(); }}>Edit</Button> 
                    </>
            )
            )}
            </div>
            {/* pass isEditing to child components */}
            {children({ isEditing })}
      </div>


        {/** Cancel Confirmation Dialog */}
        {/* open is controlled by showAlert,onOpenChange: autolly closes when clicking outside or pressing ESC                          */}
        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
          <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>All unsaved changes will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Quit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SectionCard;