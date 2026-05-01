import { Button, Card, Form, Input, message, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import type { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../store/slices/authSlice.ts";
import { useNavigate, useParams } from "react-router-dom";
import AuthLayout from "./AuthLayout.tsx";

const { Title, Text } = Typography;

interface FormValues {
    username: string,
    password: string,
}

const RegisterPage = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const { inviteToken } = useParams<{ inviteToken: string }>();
    const navigate = useNavigate();

    const { status } = useSelector((state: RootState) => state.auth);

    const onFinish = async (values: FormValues) => {
        try {
            console.log('Received values of form: ', values);
            const signUpProps = {
                inviteToken: inviteToken || '',
                userData: values,
            }

            await dispatch(signup(signUpProps)).unwrap();

            message.success('Registration successful! Redirecting...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            navigate('/signin');

        } catch (error) {
            message.error((error as string) || 'Registration failed. Please reach out with the HR.');
        }
    };

    return (
        <AuthLayout>
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
                    onFinish={onFinish}
                    scrollToFirstError
                >
                    <Form.Item
                        name="username"
                        label="username"
                        rules={ [
                            { min: 4, message: 'Username must be at least 4 characters.' },
                            { required: true, message: 'Please input your username!' }
                        ] }
                    >
                        <Input prefix={ <UserOutlined style={ { color: 'rgba(0,0,0,.25)' } }/> }
                               placeholder='username' size="large"/>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="password"
                        rules={ [
                            { required: true, message: 'Please input your password!' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ] }
                    >
                        <Input.Password
                            prefix={ <LockOutlined style={ { color: 'rgba(0,0,0,.25)' } }/> }
                            placeholder="Enter password"
                            size="large"
                        />
                    </Form.Item>

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
                        <Button type="primary" htmlType="submit" size="large" block style={ { borderRadius: '6px' } } loading={status === 'loading'}>
                            Create Account
                        </Button>
                    </Form.Item>

                    <div style={ { textAlign: 'center' } }>
                        Already have an account? <a href="/signin">Sign in</a>
                    </div>
                </Form>
            </Card>
        </AuthLayout>
    );
};

export default RegisterPage;