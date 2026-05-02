import { Form, Input, Row, Col, Typography, Space, message, Upload, Button, Spin } from 'antd';
import { UserOutlined, ContactsOutlined, HomeOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store.ts";
import axios from "axios";
import { getS3PresignedUrl } from "@/store/slices/applicationSlice.ts";

const { Text } = Typography;

const colors = {
    accent: '#a67c52',
    sectionBg: '#faf8f6',
    border: '#e8e0d5',
    label: '#595959',
};

const sectionStyle = {
    background: colors.sectionBg,
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: `1px solid ${colors.border}`,
};

const titleIconStyle = {
    color: colors.accent,
    fontSize: '18px',
};

const BasicInfoForm = ({ isReadOnly }: { isReadOnly: boolean }) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();
    const { email } = useSelector((state: RootState) => state.auth);
    const form = Form.useFormInstance();
    const dispatch = useDispatch<AppDispatch>();

    const beforeUpload = (file: File) => {
        if (isReadOnly) return false;
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Please upload an image of type JPG or PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Please upload an image smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = async (info: any) => {
        if (isReadOnly) return;

        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        const file = info.file.originFileObj;
        if (!file) return;

        try {
            const presignedProps = {
                fileName: file.name,
                fileType: file.type
            }
            const response = await dispatch(getS3PresignedUrl(presignedProps));
            const { uploadUrl, fileUrl } = response.payload;

            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            form.setFieldValue(['applicationData', 'documents', 'profilePicture', 'url'], fileUrl);
            setImageUrl(fileUrl);
            message.success('Photo uploaded successfully!');
        } catch (error) {
            console.error('S3 Upload Error:', error);
            message.error('Failed to upload photo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const currentUrl = form.getFieldValue(['applicationData', 'documents', 'profilePicture', 'url']);
        if (currentUrl) {
            setImageUrl(currentUrl);
        }

        if (email) {
            form.setFieldValue(['applicationData', 'email'], email);
        }
    }, [email, form]);

    return (
        <>
            {/* 1. Personal Information Section */}
            <div style={sectionStyle}>
                <div style={{ marginBottom: 32, textAlign: 'left'}}>
                    <Space size="middle" align="center">
                        <UserOutlined style={{...titleIconStyle, display: 'inline-flex'}}  />
                        <Text strong style={{ fontSize: '20px', color: '#434343', lineHeight: 1 }}>Personal Information</Text>
                    </Space>
                </div>

                <Row gutter={[48, 24]} align="top">
                    {/* Profile Picture Upload */}
                    <Col xs={24} sm={7} md={6} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Form.Item name={['applicationData', 'documents', 'profilePicture', 'url']}>
                                <Upload
                                    name="avatar"
                                    showUploadList={false}
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                    customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                    disabled={isReadOnly}
                                >
                                    <div style={{
                                        width: 140,
                                        height: 140,
                                        borderRadius: '50%',
                                        border: '1px dashed #d9d9d9',
                                        background: '#f5f5f5',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                        marginBottom: '16px',
                                        cursor: (loading || isReadOnly) ? 'default' : 'pointer',
                                        transition: 'all 0.3s',
                                        position: 'relative'
                                    }}>
                                        {loading && (
                                            <div style={{ position: 'absolute', zIndex: 1 }}>
                                                <Spin size="large" />
                                            </div>
                                        )}
                                        <div style={{ opacity: loading ? 0.5 : 1 }}>
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <UserOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
                                            )}
                                        </div>
                                    </div>

                                    {!isReadOnly && (
                                        <Button
                                            icon={<UploadOutlined />}
                                            style={{ borderRadius: '6px' }}
                                            loading={loading}
                                            disabled={loading}
                                        >
                                            Upload Photo
                                        </Button>
                                    )}
                                </Upload>
                            </Form.Item>
                        </div>
                    </Col>

                    {/* Name Fields */}
                    <Col xs={24} sm={17} md={18}>
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Form.Item
                                    name={['applicationData', 'firstName']}
                                    label="First Name"
                                    rules={[{ required: true, message: 'Please input your first name' }]}
                                >
                                    <Input size="large" disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name={['applicationData', 'middleName']} label="Middle Name (optional)">
                                    <Input size="large" disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name={['applicationData', 'lastName']}
                                    label="Last Name"
                                    rules={[{ required: true, message: 'Please input your last name' }]}
                                >
                                    <Input size="large" disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item name={['applicationData', 'preferredName']} label="Preferred Name (optional)">
                                    <Input size="large" disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            {/* 2. Contact Section */}
            <div style={sectionStyle}>
                <div style={{ marginBottom: 32, textAlign: 'left'}}>
                    <Space size="middle" align="center">
                        <ContactsOutlined style={{...titleIconStyle, display: 'inline-flex'}} />
                        <Text strong style={{ fontSize: '20px', color: '#434343', lineHeight: 1 }}>Contact</Text>
                    </Space>
                </div>

                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Form.Item
                            name={['applicationData', 'email']}
                            label="Email Address"
                            rules={[
                                { required: true, message: 'Please input your email' },
                                { type: 'email', message: 'Invalid email format' }
                            ]}
                        >
                            <Input size="large" disabled />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={['applicationData', 'phone', 'mobile']}
                            label="Mobile Phone"
                            rules={[{ required: true, message: 'Please input your mobile phone' }]}
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={['applicationData', 'phone', 'work']}
                            label="Work Phone (optional)"
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* 3. Address Section */}
            <div style={{ ...sectionStyle, marginBottom: 0 }}>
                <div style={{ marginBottom: 32, textAlign: 'left'}}>
                    <Space size="middle" align="center">
                        <HomeOutlined style={{...titleIconStyle, display: 'inline-flex'}}  />
                        <Text strong style={{ fontSize: '20px', color: '#434343', lineHeight: 1 }}>Address</Text>
                    </Space>
                </div>

                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={18}>
                        <Form.Item
                            name={['applicationData', 'address', 'street']}
                            label="Street Address"
                            rules={[{ required: true, message: 'Please input your street address' }]}
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name={['applicationData', 'address', 'buildingNumber']}
                            label="Apt/Suite (optional)"
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['applicationData', 'address', 'city']}
                            label="City"
                            rules={[{ required: true, message: 'Please input your city' }]}
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['applicationData', 'address', 'state']}
                            label="State"
                            rules={[{ required: true, message: 'Please input the state' }]}
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['applicationData', 'address', 'zipCode']}
                            label="Zip Code"
                            rules={[{ required: true, message: 'Please input the zip code' }]}
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default BasicInfoForm;