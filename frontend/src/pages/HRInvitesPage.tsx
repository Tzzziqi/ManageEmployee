import { useState, useEffect } from 'react';
import {
    Table, Tag, Button, Space, Typography, message,
    Modal, Tooltip, Form, Input, Select
} from 'antd';
import {
    DeleteOutlined,
    MailOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    UserOutlined,
    StopOutlined,
    PlusOutlined,
    SendOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import HRSidebar from "../components/HRSidebar";
import inviteTokenService from "@/services/inviteTokenService";

const { Text, Title } = Typography;
const { Option } = Select;

// --- UI Styling Configuration ---
const colors = {
    accent: '#a67c52',
    sectionBg: '#faf8f6',
    border: '#e8e0d5',
    title: '#434343'
};

const sectionStyle = {
    background: colors.sectionBg,
    padding: '24px',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
};

const HRInvitesPage = () => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // 1. Fetch All Invitations from Backend
    const fetchInvites = async () => {
        setLoading(true);
        try {
            // Adjust the URL to match your backend API prefix
            const response = await inviteTokenService.getInvites();
            setInvites(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Failed to load invitation list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvites();
    }, []);

    // 2. Generate and Send New Invitation
    const handleCreateInvite = async (values) => {
        try {
            setLoading(true);
            await inviteTokenService.generateInvite(values);

            message.success('Invitation token generated and email sent!');
            setIsModalOpen(false);
            form.resetFields();
            fetchInvites(); // Refresh list to see the new entry
        } catch (error) {
            console.error('Generation error:', error);
            message.error(error.response?.data?.message || 'Failed to generate invitation');
        } finally {
            setLoading(false);
        }
    };

    // 3. Revoke Invitation (Update status instead of deleting)
    const handleRevoke = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to revoke this invitation?',
            content: 'The token will be invalidated immediately and marked as "Revoked" for record-keeping.',
            okText: 'Revoke Now',
            okType: 'danger',
            cancelText: 'Keep Active',
            async onOk() {
                try {
                    await inviteTokenService.revokeInvites(id);

                    // Update local state to reflect the change immediately
                    setInvites(prev => prev.map(item =>
                        item._id === id ? { ...item, status: 'revoked' } : item
                    ));

                    message.success('Invitation has been revoked');
                } catch (error) {
                    console.error('Revoke error:', error);
                    message.error(error.response?.data?.message || 'Failed to revoke token');
                    throw new Error('Revoke operation failed');
                }
            },
        });
    };

    const handleCopyToken = (token) => {
        navigator.clipboard.writeText(token);
        message.success('Token copied to clipboard');
    };

    // --- Table Column Definitions ---
    const columns = [
        {
            title: 'Candidate / Role',
            dataIndex: 'email',
            key: 'email',
            render: (email, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <MailOutlined style={{ color: colors.accent }} />
                        <Text strong>{email}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '22px' }}>
                        <UserOutlined style={{ fontSize: '10px' }} /> {record.role}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Token',
            dataIndex: 'inviteToken',
            key: 'inviteToken',
            render: (token) => (
                <Space>
                    <Text code style={{ backgroundColor: '#f5f5f5' }}>{token}</Text>
                    <Tooltip title="Copy Token">
                        <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyToken(token)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: 'Expires At',
            dataIndex: 'expirationDate',
            key: 'expirationDate',
            render: (date) => (
                <Space>
                    <ClockCircleOutlined style={{ color: '#bfbfbf' }} />
                    <Text type="secondary">{dayjs(date).format('YYYY-MM-DD HH:mm')}</Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            width: 120,
            render: (_, record) => {
                const isExpired = dayjs().isAfter(dayjs(record.expirationDate));
                let displayStatus = record.status;
                let color = 'default';

                // Priority Logic: Used > Revoked > Expired > Pending
                if (record.status === 'used') {
                    color = 'blue';
                } else if (record.status === 'revoked') {
                    color = 'orange';
                } else if (isExpired) {
                    displayStatus = 'expired';
                    color = 'error';
                } else {
                    displayStatus = 'pending';
                    color = 'processing';
                }

                return <Tag color={color}>{displayStatus.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (_, record) => {
                const isExpired = dayjs().isAfter(dayjs(record.expirationDate));
                // Disable if already used, revoked, or expired
                const isDisabled = record.status === 'used' || record.status === 'revoked' || isExpired;

                return (
                    <Button
                        type="link"
                        danger
                        disabled={isDisabled}
                        icon={record.status === 'revoked' ? <StopOutlined /> : <DeleteOutlined />}
                        onClick={() => handleRevoke(record._id)}
                    >
                        {record.status === 'revoked' ? 'Revoked' : 'Revoke'}
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#f7f6f2]">
            <HRSidebar />

            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header with Generate Button */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <Title level={2} style={{ color: colors.title, margin: 0 }}>
                                Invitation Management
                            </Title>
                            <Text type="secondary">Manage employee registration tokens and track onboarding status.</Text>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            style={{ backgroundColor: colors.accent, borderColor: colors.accent }}
                        >
                            Generate Invite
                        </Button>
                    </div>

                    {/* Main Table Content */}
                    <div style={sectionStyle}>
                        <Table
                            columns={columns}
                            dataSource={invites}
                            rowKey="_id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showTotal: (total) => `Total ${total} invitations`
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal for Generating New Invitation */}
            <Modal
                title={<span><SendOutlined /> Generate Registration Token</span>}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                okText="Send Invitation"
                okButtonProps={{ style: { backgroundColor: colors.accent, borderColor: colors.accent } }}
                destroyOnClose // Reset modal state on close
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateInvite}
                    initialValues={{ role: 'employee' }}
                    style={{ marginTop: 24 }}
                >
                    <Form.Item
                        name="email"
                        label="Candidate Email"
                        rules={[
                            { required: true, message: 'Recipient email is required' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                    >
                        <Input placeholder="name@example.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Assign Role"
                        rules={[{ required: true }]}
                    >
                        <Select size="large">
                            <Option value="employee">employee</Option>
                            <Option value="hr">hr</Option>
                        </Select>
                    </Form.Item>

                    <div style={{ backgroundColor: '#fffbe6', padding: '12px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                        <Text type="warning" style={{ fontSize: '13px' }}>
                            Notice: This will generate a unique token and send it via email. The token will remain valid for 3 hours.
                        </Text>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default HRInvitesPage;