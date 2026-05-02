import { Descriptions, Divider, Typography, Tag, Form, Image } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ReviewForm = ({ isReadOnly }: { isReadOnly: boolean }) => {
    const form = Form.useFormInstance();
    const applicationData = form.getFieldValue('applicationData') || {};

    const descriptionProps = {
        bordered: true,
        column: 1,
        size: "middle" as const,
        labelStyle: {
            width: '200px',
            backgroundColor: '#fafafa',
            fontWeight: 600
        },
        contentStyle: {
            backgroundColor: '#ffffff'
        }
    };

    const getDocUrl = (field: any) => {
        if (!field) return null;
        if (typeof field === 'string') return field;
        if (Array.isArray(field) && field.length > 0) {
            return field[0].url || field[0].response;
        }
        if (field.url) return field.url;
        return null;
    };

    const profilePicUrl = getDocUrl(applicationData.documents?.profilePicture?.url);
    const driverLicenseUrl = getDocUrl(applicationData.documents?.driverLicense?.url);
    const workAuthUrl = getDocUrl(applicationData.documents?.workAuthorization?.url);

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Title level={3} style={{ marginBottom: 32, textAlign: 'center' }}>
                {isReadOnly ? 'Application Details' : 'Review Your Application'}
            </Title>

            <Descriptions title="Documents & Photos" {...descriptionProps}>
                <Descriptions.Item label="Profile Picture">
                    {profilePicUrl ? (
                        <div style={{ padding: '8px 0' }}>
                            <Image
                                width={120}
                                height={120}
                                src={profilePicUrl}
                                style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid #d9d9d9' }}
                                alt="Profile"
                            />
                        </div>
                    ) : (
                        <Text type="secondary">No photo uploaded</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Driver License">
                    {driverLicenseUrl ? (
                        <a
                            href={driverLicenseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#a67c52', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FilePdfOutlined /> View Uploaded Document (Open in new tab)
                        </a>
                    ) : (
                        <Text type="secondary">Not provided</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Work Authorization">
                    {workAuthUrl ? (
                        <a
                            href={workAuthUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#a67c52', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FilePdfOutlined /> View Uploaded Document (Open in new tab)
                        </a>
                    ) : (
                        <Text type="secondary">Not provided</Text>
                    )}
                </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '40px 0' }} />

            <Descriptions title={<Text strong style={{ fontSize: 18 }}>Personal Information</Text>} {...descriptionProps}>
                <Descriptions.Item label="First Name">{applicationData.firstName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Middle Name">{applicationData.middleName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{applicationData.lastName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Preferred Name">{applicationData.preferredName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Email Address">{applicationData.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mobile Phone">{applicationData.phone?.mobile || '-'}</Descriptions.Item>
                <Descriptions.Item label="Work Phone">{applicationData.phone?.work || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '24px 0' }} />

            <Descriptions title={<Text strong style={{ fontSize: 18 }}>Current Address</Text>} {...descriptionProps}>
                <Descriptions.Item label="Street Address">{applicationData.address?.street || '-'}</Descriptions.Item>
                <Descriptions.Item label="Apt/Suite">{applicationData.address?.buildingNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="City">{applicationData.address?.city || '-'}</Descriptions.Item>
                <Descriptions.Item label="State">{applicationData.address?.state || '-'}</Descriptions.Item>
                <Descriptions.Item label="Zip Code">{applicationData.address?.zipCode || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '24px 0' }} />


            <Descriptions title={<Text strong style={{ fontSize: 18 }}>Identity</Text>} {...descriptionProps}>
                <Descriptions.Item label="SSN">{applicationData.personalInfo?.ssn || '-'}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">
                    {applicationData.personalInfo?.dateOfBirth
                        ? dayjs(applicationData.personalInfo.dateOfBirth).format('MM-DD-YYYY')
                        : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                    <span style={{ textTransform: 'capitalize' }}>{applicationData.personalInfo?.gender || '-'}</span>
                </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '24px 0' }} />

            <Descriptions title={<Text strong style={{ fontSize: 18 }}>Work Authorization</Text>} {...descriptionProps}>
                <Descriptions.Item label="isCitizenOrPR">{applicationData.workAuthorization?.isCitizenOrPR || '-'}</Descriptions.Item>
                <Descriptions.Item label="citizenType">{applicationData.workAuthorization?.citizenType || '-'}</Descriptions.Item>
                <Descriptions.Item label="workAuthType">{applicationData.workAuthorization?.workAuthType || '-'}</Descriptions.Item>
                <Descriptions.Item label="otherVisaTitle">{applicationData.workAuthorization?.otherVisaTitle || '-'}</Descriptions.Item>
                <Descriptions.Item label="start date">
                    {applicationData.workAuthorization?.startDate
                        ? dayjs(applicationData.workAuthorization.startDate).format('MM-DD-YYYY')
                        : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="end date">
                    {applicationData.workAuthorization?.endDate
                        ? dayjs(applicationData.workAuthorization.endDate).format('MM-DD-YYYY')
                        : '-'}
                </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '24px 0' }} />

            <Descriptions title={<Text strong style={{ fontSize: 18 }}>Reference</Text>} {...descriptionProps}>
                <Descriptions.Item label="First Name">{applicationData.reference?.firstName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Middle Name">{applicationData.reference?.middleName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{applicationData.reference?.lastName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Relationship">{applicationData.reference?.relationship || '-'}</Descriptions.Item>
                <Descriptions.Item label="Email Address">{applicationData.reference?.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mobile Phone">{applicationData.reference?.mobile || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '24px 0' }} />

            {/* --- 緊急聯絡人 --- */}
            <Title level={5} style={{ marginBottom: 20 }}>Emergency Contacts</Title>
            {applicationData.emergencyContacts && applicationData.emergencyContacts.length > 0 ? (
                applicationData.emergencyContacts.map((contact: any, index: number) => (
                    <div key={index} style={{ marginBottom: 16, padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                        <Descriptions {...descriptionProps} title={`Contact #${index + 1}`}>
                            <Descriptions.Item label="First Name">{contact.firstName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Middle Name">{contact.middleName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Last Name">{contact.lastName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Relationship">{contact.relationship || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Email Address">{contact.email || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{contact.phone || '-'}</Descriptions.Item>
                        </Descriptions>
                    </div>
                ))
            ) : (
                <Text type="secondary">No emergency contacts listed.</Text>
            )}
        </div>
    );
};

export default ReviewForm;