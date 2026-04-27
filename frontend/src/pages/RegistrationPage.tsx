import { Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [form] = Form.useForm();

    interface RegisterFormValues {
        username?: string;
        email?: string;
        password?: string;
        confirm?: string;
    }

    return (
        <div style={ {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5'
        } }>
            <Card
                style={ {
                    width: 400,
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                } }
            >
                <div style={ { textAlign: 'center', marginBottom: '24px' } }>
                    <Title level={ 2 } style={ { marginBottom: '8px' } }>Sign Up</Title>
                    <Text type="secondary">Create your account to get started</Text>
                </div>

                <Form
                    form={ form }
                    name="register"
                    layout="vertical"
                    scrollToFirstError
                >
                    <Form.Item
                        name="username"
                        label="username"
                        rules={ [
                            { min: 4, message: 'Username must be at least 3 characters.' },
                            { required: true, message: 'Please input your username!' }
                        ] }
                    >
                        <Input prefix={ <UserOutlined style={ { color: 'rgba(0,0,0,.25)' } }/> }
                               placeholder='' size="large"/>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="password"
                        rules={ [
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ] }
                    >
                        <Input.Password
                            prefix={ <LockOutlined style={ { color: 'rgba(0,0,0,.25)' } }/> }
                            placeholder="Enter password"
                            size="large"
                        />
                    </Form.Item>

                    {/* 確認密碼 */ }
                    <Form.Item
                        name="confirm"
                        label="Confirm Password"
                        dependencies={ ['password'] }
                        rules={ [
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ] }
                    >
                        <Input.Password
                            prefix={ <LockOutlined style={ { color: 'rgba(0,0,0,.25)' } }/> }
                            placeholder="Re-enter password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item style={ { marginTop: '32px' } }>
                        <Button type="primary" htmlType="submit" size="large" block style={ { borderRadius: '6px' } }>
                            Create Account
                        </Button>
                    </Form.Item>

                    <div style={ { textAlign: 'center' } }>
                        Already have an account? <a href="/login">Log in</a>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;