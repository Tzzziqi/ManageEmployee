import { Button, Col, DatePicker, Form, Input, message, Radio, Row, Select, Space, Typography, Upload } from 'antd';
import { GlobalOutlined, IdcardOutlined, UploadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getS3PresignedUrl } from "@/store/slices/applicationSlice.ts";
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store.ts";
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

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
    border: `1px solid ${ colors.border }`,
};

const titleIconStyle = {
    color: colors.accent,
    fontSize: '18px',
};

const IdentityForm = ({ isReadOnly }: { isReadOnly: boolean }) => {
    const form = Form.useFormInstance();

    const isCitizen = Form.useWatch(['applicationData', 'workAuthorization', 'isCitizenOrPR'], form);
    const visaType = Form.useWatch(['applicationData', 'workAuthorization', 'workAuthType'], form);

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    // 檔案上傳處理 (通用)
    const uploadToS3 = async (file: File, onSuccess: any, onError: any, onProgress: any) => {
        setLoading(true);
        try {
            const presignedProps = {
                fileName: file.name,
                fileType: file.type
            };
            const response = await dispatch(getS3PresignedUrl(presignedProps));
            const { uploadUrl, fileUrl } = response.payload;

            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (event) => {
                    const percent = Math.floor((event.loaded / (event.total || 1)) * 100);
                    onProgress({ percent });
                }
            });

            onSuccess(fileUrl);
        } catch (error) {
            onError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleWorkAuthorizationUpload = (options: any) => {
        uploadToS3(options.file, options.onSuccess, options.onError, options.onProgress)
            .then(() => message.success('Work Authorization uploaded successfully!'))
            .catch(() => message.error('Failed to upload work authorization.'));
    };

    const handleDriverLicenseUpload = (options: any) => {
        uploadToS3(options.file, options.onSuccess, options.onError, options.onProgress)
            .then(() => message.success('Driver License uploaded successfully!'))
            .catch(() => message.error('Failed to upload driver license.'));
    };

    // 資料轉換工具
    const dateConvert = (value: any) => ({
        value: value ? dayjs(value) : undefined,
    });

    const fileConvert = (value: any) => {
        if (!value) return { fileList: [] };
        if (Array.isArray(value)) return { fileList: value };
        return {
            fileList: [{
                uid: '-1',
                name: 'Uploaded_Document.pdf',
                status: 'done',
                url: value
            }]
        };
    };

    const yesNoConvert = (value: any) => {
        if (value === true) return { value: 'yes' };
        if (value === false) return { value: 'no' };
        return { value };
    };

    const handleFileEvent = (e: any) => {
        const fileList = Array.isArray(e) ? e : e?.fileList;
        return fileList?.map((file: any) => {
            if (file.status === 'done' && file.response) {
                return { ...file, url: file.url || file.response };
            }
            return file;
        });
    };

    return (
        <>
            {/* 1. Identity Information Section */}
            <div style={ sectionStyle }>
                <div style={ { marginBottom: 32, textAlign: 'left' } }>
                    <Space size="middle" align="center">
                        <IdcardOutlined style={ titleIconStyle }/>
                        <Text strong style={ { fontSize: '20px', color: '#434343' } }>Identity Information</Text>
                    </Space>
                </div>

                <Row gutter={ [48, 24] }>
                    <Col span={ 24 }>
                        <Row gutter={ [16, 16] }>
                            <Col span={ 8 }>
                                <Form.Item
                                    name={ ['applicationData', 'personalInfo', 'ssn'] }
                                    label="SSN"
                                    rules={ [{ required: true, message: 'Required' }] }
                                >
                                    <Input size="large" disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                            <Col span={ 8 }>
                                <Form.Item
                                    name={ ['applicationData', 'personalInfo', 'dateOfBirth'] }
                                    label="Date of Birth"
                                    rules={ [{ required: true, message: 'Required' }] }
                                    getValueProps={ dateConvert }
                                >
                                    <DatePicker size="large" style={ { width: '100%' } } disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                            <Col span={ 8 }>
                                <Form.Item name={ ['applicationData', 'personalInfo', 'gender'] } label="Gender" rules={ [{ required: true, message: 'Required' }] }>
                                    <Select size="large" disabled={isReadOnly}>
                                        <Option value="male">Male</Option>
                                        <Option value="female">Female</Option>
                                        <Option value="no-answer">I do not wish to answer</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={ 24 }>
                                <Form.Item
                                    name={ ['applicationData', 'documents', 'driverLicense', 'url'] }
                                    label="Driver's License (Optional)"
                                    valuePropName="fileList"
                                    getValueProps={fileConvert}
                                    getValueFromEvent={handleFileEvent}
                                >
                                    <Upload
                                        customRequest={handleDriverLicenseUpload}
                                        maxCount={1}
                                        accept=".pdf"
                                        listType="picture"
                                        disabled={isReadOnly}
                                    >
                                        {!isReadOnly && <Button icon={ <UploadOutlined/> }>Upload License PDF</Button>}
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            {/* 2. Work Authorization Section */}
            <div style={sectionStyle}>
                <div style={{ marginBottom: 32, textAlign: 'left' }}>
                    <Space size="middle" align="center">
                        <GlobalOutlined style={titleIconStyle} />
                        <Text strong style={{ fontSize: '20px', color: '#434343' }}>Work Authorization</Text>
                    </Space>
                </div>

                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Form.Item
                            label="Permanent resident or citizen of the U.S.?"
                            name={['applicationData', 'workAuthorization', 'isCitizenOrPR']}
                            rules={[{ required: true, message: 'Please select your status' }]}
                            getValueProps={yesNoConvert}
                        >
                            <Radio.Group size="large" disabled={isReadOnly}>
                                <Radio value="yes">Yes</Radio>
                                <Radio value="no">No</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>

                    {isCitizen === 'yes' && (
                        <Col span={12}>
                            <Form.Item
                                label="Select your status"
                                name={['applicationData', 'workAuthorization', 'citizenType']}
                                rules={[{ required: true, message: 'Please select' }]}
                            >
                                <Select size="large" placeholder="Choose one" disabled={isReadOnly}>
                                    <Option value="green-card">Green Card</Option>
                                    <Option value="citizen">Citizen</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    )}

                    {isCitizen === 'no' && (
                        <>
                            <Col span={12}>
                                <Form.Item
                                    label="What is your work authorization?"
                                    name={['applicationData', 'workAuthorization', 'workAuthType']}
                                    rules={[{ required: true, message: 'Please select visa type' }]}
                                >
                                    <Select size="large" placeholder="Select visa type" disabled={isReadOnly}>
                                        <Option value="H1-B">H1-B</Option>
                                        <Option value="L2">L2</Option>
                                        <Option value="F1">F1 (CPT/OPT)</Option>
                                        <Option value="H4">H4</Option>
                                        <Option value="Other">Other</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            {visaType === 'Other' && (
                                <Col span={12}>
                                    <Form.Item
                                        label="Please specify visa title"
                                        name={['applicationData', 'workAuthorization', 'otherVisaTitle']}
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <Input size="large" placeholder="Enter visa title" disabled={isReadOnly} />
                                    </Form.Item>
                                </Col>
                            )}

                            {visaType === 'F1' && (
                                <Col span={12}>
                                    <div style={{
                                        padding: '16px',
                                        background: '#fafafa',
                                        borderRadius: '8px',
                                        border: '1px dashed #d9d9d9',
                                        height: 'auto',
                                        minHeight: '88px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <Form.Item
                                            label="OPT Receipt"
                                            name={['applicationData', 'documents', 'workAuthorization', 'url']}
                                            valuePropName="fileList"
                                            getValueProps={fileConvert}
                                            getValueFromEvent={handleFileEvent}
                                            rules={[{ required: true, message: 'Required' }]}
                                            style={{ marginBottom: 0, width: '100%' }}
                                        >
                                            <Upload
                                                customRequest={handleWorkAuthorizationUpload}
                                                maxCount={1}
                                                accept=".pdf"
                                                listType="picture"
                                                disabled={isReadOnly}
                                            >
                                                {!isReadOnly && (
                                                    <Button icon={<FilePdfOutlined />} size="large" block loading={loading}>
                                                        Upload OPT Receipt
                                                    </Button>
                                                )}
                                            </Upload>
                                        </Form.Item>
                                    </div>
                                </Col>
                            )}

                            <Col span={12}>
                                <Form.Item
                                    label="Start Date"
                                    name={['applicationData', 'workAuthorization', 'startDate']}
                                    rules={[{ required: true, message: 'Required' }]}
                                    getValueProps={dateConvert}
                                >
                                    <DatePicker size="large" style={{ width: '100%' }} disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="End Date"
                                    name={['applicationData', 'workAuthorization', 'endDate']}
                                    rules={[{ required: true, message: 'Required' }]}
                                    getValueProps={dateConvert}
                                >
                                    <DatePicker size="large" style={{ width: '100%' }} disabled={isReadOnly} />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                </Row>
            </div>
        </>
    );
};

export default IdentityForm;
