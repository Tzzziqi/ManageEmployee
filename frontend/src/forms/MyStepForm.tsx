import { Button, Card, Form, Steps } from "antd";
import { useEffect, useState } from "react";
import BasicInfoForm from "./BasicInfoForm.tsx";

const MyStepForm = ({ initialValues }: { initialValues: any }) => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    // 1. 定義步驟的數據
    const stepData = [
        {
            title: 'Basic Information',
            content: <BasicInfoForm />
        },
        {
            title: '後續步驟',
            content: <div style={{ padding: '40px 0', textAlign: 'center', color: '#8c8c8c' }}>更多內容開發中...</div>
        },
    ];

    // 2. 處理導覽按鈕
    const next = async () => {
        try {
            await form.validateFields();
            setCurrent(current + 1);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Form form={form} layout='vertical' onFinish={() => console.log("Submitted:", form.getFieldsValue())}>

            <Steps
                current={current}
                items={stepData.map(item => ({ title: item.title }))}
                style={{ marginBottom: 40, padding: '0 20px' }}
            />

            <Card
                bordered={false}
                style={{
                    borderRadius: '20px',
                    boxShadow: '0 12px 40px rgba(166, 124, 82, 0.1)',
                    background: '#ffffff'
                }}
            >
                {stepData[current].content}

                <div style={{
                    marginTop: 40,
                    textAlign: 'right',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 24
                }}>
                    {current > 0 && (
                        <Button onClick={() => setCurrent(current - 1)} style={{ borderRadius: '6px' }}>
                            Previous
                        </Button>
                    )}

                    <Button
                        type="primary"
                        onClick={current === stepData.length - 1 ? () => form.submit() : next}
                        style={{
                            marginLeft: 12,
                            borderRadius: '6px',
                            backgroundColor: '#a67c52',
                            borderColor: '#a67c52',
                            height: '40px'
                        }}
                    >
                        {current === stepData.length - 1 ? 'Submit' : 'Next'}
                    </Button>
                </div>
            </Card>
        </Form>
    )
}

export default MyStepForm;