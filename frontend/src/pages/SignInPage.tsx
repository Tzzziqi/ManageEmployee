import React from 'react';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import AuthLayout from './AuthLayout';
import type { SignInProps } from "../services/authService.ts";
import { signIn } from "../store/slices/authSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store.ts";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const SignIn: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const authStatus = useSelector((state: RootState) => state.auth.status);

    const onFinish = async (values: SignInProps) => {
        try {
            await dispatch(signIn(values)).unwrap();
            message.success('Sign In successful! Redirecting...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            navigate('/application');
        } catch (error) {
            message.error((error as string) || 'Sign In. Please reach out with the HR.');
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
                    <Title level={ 2 } style={ { marginBottom: '8px' } }>Sign In</Title>
                    <Text type="secondary">Enter your credentials to access your account</Text>
                </div>

                <Form
                    form={ form }
                    name="register"
                    layout="vertical"
                    onFinish={ onFinish }
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

                    <Form.Item style={ { marginTop: '32px' } }>
                        <Button type="primary" htmlType="submit" size="large" block style={ { borderRadius: '6px' } }
                                loading={ authStatus === 'loading' }>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </AuthLayout>
    );
};

export default SignIn;
