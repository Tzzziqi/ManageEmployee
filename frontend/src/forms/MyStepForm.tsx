import { Button, Card, Form, message, Steps } from "antd";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import BasicInfoForm from "./BasicInfoForm.tsx";
import IdentityForm from "@/forms/IdentityForm.tsx";
import ReferenceForm from "@/forms/ReferenceForm.tsx";
import ReviewForm from "@/forms/ReviewForm.tsx";
import applicationService, { type applicationRequest } from "@/services/applicationService.ts";
import { logout } from "@/store/slices/authSlice.ts";
import type { AppDispatch, RootState } from "@/store/store.ts";
import { submitApplication, updateApplication } from "@/store/slices/applicationSlice.ts";

const MyStepForm = ({ initialValues, isReadOnly, status }: { initialValues: any, isReadOnly: boolean, status: string }) => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const { id } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    const stepData = [
        { title: 'Basic Information', content: <BasicInfoForm isReadOnly={ isReadOnly }/> },
        { title: 'Identity & Work Authorization', content: <IdentityForm isReadOnly={ isReadOnly }/> },
        { title: 'References & Emergency', content: <ReferenceForm isReadOnly={ isReadOnly }/> },
        { title: 'Review & Submit', content: <ReviewForm isReadOnly={ isReadOnly }/> },
    ];


    const next = async () => {
        if (isReadOnly) {
            setCurrent(current + 1);
            return;
        }

        try {
            await form.validateFields();
            setCurrent(current + 1);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };


    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        try {

            const allValues = form.getFieldsValue(true);
            const rawData = { ...allValues.applicationData };

            const toDate = (val: any) => (val && dayjs.isDayjs(val) ? val.toDate() : null);

            const mapDocument = (fileField: any) => {
                const url = Array.isArray(fileField) ? (fileField[0]?.url || fileField[0]?.response) : fileField;
                return {
                    url: url || '',
                    s3Key: '',
                    uploadedAt: new Date()
                };
            };

            const requestBody: applicationRequest = {
                userId: id,
                status: 'pending',
                applicationData: {
                    ...rawData,
                    personalInfo: {
                        ...rawData.personalInfo,
                        dateOfBirth: toDate(rawData.personalInfo?.dateOfBirth),
                    },
                    workAuthorization: {
                        ...rawData.workAuthorization,
                        isCitizenOrPR: rawData.workAuthorization?.isCitizenOrPR === 'yes',
                        startDate: toDate(rawData.workAuthorization?.startDate),
                        endDate: toDate(rawData.workAuthorization?.endDate),
                    },
                    emergencyContacts: rawData.emergencyContacts?.map((contact: any) => ({
                        ...contact,
                        middleName: contact.middleName || ''
                    })),
                    documents: {
                        profilePicture: {
                            url: rawData.documents?.profilePicture?.url || '',
                            s3Key: '',
                            uploadedAt: new Date()
                        },
                        workAuthorization: mapDocument(rawData.documents?.workAuthorization?.url),
                        driverLicense: mapDocument(rawData.documents?.driverLicense?.url),
                    }
                }
            };

            console.log('Submitting Request Body:', requestBody);

            if (status) {
                await applicationService.updateApplication(requestBody);
            } else {
                await applicationService.submitApplication(requestBody);
            }


            message.success('Successfully submitted application!');


            setTimeout(() => {
                dispatch(logout());
                navigate('/signin');
            }, 1000);

        } catch (error) {
            console.error("Error submitting application:", error);
            message.error('Failed to submit application.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form
            form={ form }
            layout='vertical'
            onFinish={ onFinish }

        >
            <Steps
                current={ current }
                items={ stepData.map(item => ({ title: item.title })) }
                style={ { marginBottom: 40, padding: '0 20px' } }
            />

            <Card
                bordered={ false }
                style={ {
                    borderRadius: '20px',
                    boxShadow: '0 12px 40px rgba(166, 124, 82, 0.1)',
                    background: '#ffffff'
                } }
            >

                <fieldset
                    disabled={ isReadOnly }
                    style={ { border: 'none', padding: 0, margin: 0 } }
                >
                    { stepData[current].content }
                </fieldset>


                <div style={ {
                    marginTop: 40,
                    textAlign: 'right',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 24
                } }>
                    { current > 0 && (
                        <Button
                            onClick={ prev }
                            style={ {
                                marginLeft: 12,
                                borderRadius: '6px',
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                                height: '40px'
                            } }
                        >
                            Previous
                        </Button>
                    ) }

                    { current < stepData.length - 1 && (
                        <Button
                            type="primary"
                            onClick={ next }
                            style={ {
                                marginLeft: 12,
                                borderRadius: '6px',
                                backgroundColor: '#a67c52',
                                borderColor: '#a67c52',
                                height: '40px'
                            } }
                        >
                            Next
                        </Button>
                    ) }

                    { current === stepData.length - 1 && !isReadOnly && (
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={ isSubmitting }
                            style={ {
                                marginLeft: 12,
                                borderRadius: '6px',
                                backgroundColor: '#a67c52',
                                borderColor: '#a67c52',
                                height: '40px'
                            } }
                        >
                            Submit Application
                        </Button>
                    ) }
                </div>
            </Card>
        </Form>
    );
};

export default MyStepForm;