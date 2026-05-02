import { Form, Input, Row, Col, Typography, Space, message, Upload, Button } from 'antd';
import type { UploadProps } from 'antd';
import { UserOutlined, ContactsOutlined, HomeOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from "react";

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

const BasicInfoForm = () => {
    const [, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();

    const getBase64 = (img: Blob, callback: (url: string) => void) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result as string));
        reader.readAsDataURL(img);
    };

    // 上傳前的檢查
    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('只能上傳 JPG/PNG 檔案!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('圖片大小必須小於 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if ((info.file.status === 'done' || info.file.originFileObj) && info.file.originFileObj) {
            // 這裡示範本地預覽，實際開發應串接 API
            getBase64(info.file.originFileObj, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };

    return (
        <>
            <div style={sectionStyle}>

                <div style={{ marginBottom: 32 }}>
                    <Space size="middle" align="center">
                        <UserOutlined style={{...titleIconStyle, display: 'inline-flex'}}  />
                        <Text strong style={{ fontSize: '20px', color: '#434343', lineHeight: 1 }}>Personal Information</Text>
                    </Space>
                </div>

                <Row gutter={[48, 24]} align="top">

                    <Col xs={24} sm={7} md={6} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <Form.Item
                                name={['applicationData', 'profilePicture']}
                                valuePropName="fileList"
                                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                                noStyle
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
                                    marginBottom: '12px'
                                }}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <UserOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
                                    )}
                                </div>
                            </Form.Item>

                            <Upload
                                name="avatar"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                            >
                                <Button icon={<UploadOutlined />} style={{ borderRadius: '6px' }}>
                                    Upload Photo
                                </Button>
                            </Upload>
                            <Text type="secondary" style={{ fontSize: '12px' }}>recommand size: 500x500 px</Text>
                        </div>
                    </Col>


                    <Col xs={24} sm={17} md={18}>
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Form.Item
                                    name={['applicationData', 'firstName']}
                                    label="First Name"
                                    rules={[{ required: true, message: 'Please input your first name' }]}
                                >
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name={['applicationData', 'middleName']} label="Middle Name (optional)">
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name={['applicationData', 'lastName']}
                                    label="Last Name"
                                    rules={[{ required: true, message: 'Please input your last name' }]}
                                >
                                    <Input size="large" />
                                </Form.Item>
                            </Col>

                            <Col span={16}>
                                <Form.Item name={['applicationData', 'preferredName']} label="Preferred Name (optional)">
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            <div style={sectionStyle}>
                <div style={{ marginBottom: 20 }}>
                    <Space size="middle" align="center">
                        <ContactsOutlined style={{...titleIconStyle, display: 'inline-flex'}} />
                        <Text strong style={{ fontSize: '20px', color: '#434343', lineHeight: 1 }}>Contract</Text>
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
                            <Input size="large" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={['applicationData', 'phone', 'mobile']}
                            label="Mobile Phone"
                            rules={[{ required: true, message: 'Please input your mobile phone' }]}
                        >
                            <Input size="large" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={['applicationData', 'phone', 'work']}
                            label="Work Phone (optional)"
                        >
                            <Input size="large" />
                        </Form.Item>
                    </Col>
                </Row>
            </div>


            <div style={{ ...sectionStyle, marginBottom: 0 }}>
                <div style={{ marginBottom: 20 }}>
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
                            <Input size="large" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name={['applicationData', 'address', 'buildingNumber']}
                            label="Apt/Suite (optional)"
                        >
                            <Input size="large" />
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
                            <Input size="large" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['applicationData', 'address', 'state']}
                            label="State"
                            rules={[{ required: true, message: 'Please input the state' }]}
                        >
                            <Input size="large" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['applicationData', 'address', 'zipCode']}
                            label="Zip Code"
                            rules={[{ required: true, message: 'Please input the zip code' }]}
                        >
                            <Input size="large" />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default BasicInfoForm;
