import { Button, Col, Form, Input, Row, Space, Typography } from 'antd';
import { AlertOutlined, DeleteOutlined, PlusOutlined, UsergroupAddOutlined } from '@ant-design/icons';

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
    border: `1px solid ${ colors.border }`,
};

const titleIconStyle = {
    color: colors.accent,
    fontSize: '18px',
};

const ReferenceForm = ({ isReadOnly }: { isReadOnly: boolean }) => {

    return (
        <>
            {/* 1. Reference Section */}
            <div style={ sectionStyle }>
                <div style={ { marginBottom: 32, textAlign: 'left' } }>
                    <Space size="middle" align="center">
                        <UsergroupAddOutlined style={ { ...titleIconStyle, display: 'inline-flex' } }/>
                        <Text strong style={ { fontSize: '20px', color: '#434343', lineHeight: 1 } }>Reference</Text>
                    </Space>
                </div>

                <Row gutter={ [16, 0] }>
                    <Col xs={ 24 } sm={ 8 }>
                        <Form.Item
                            name={ ['applicationData', 'reference', 'firstName'] }
                            label="First Name"
                            rules={ [{ required: true, message: 'Required' }] }
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={ 24 } sm={ 8 }>
                        <Form.Item name={ ['applicationData', 'reference', 'middleName'] }
                                   label="Middle Name (optional)">
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={ 24 } sm={ 8 }>
                        <Form.Item
                            name={ ['applicationData', 'reference', 'lastName'] }
                            label="Last Name"
                            rules={ [{ required: true, message: 'Required' }] }
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={ [16, 0] }>
                    <Col xs={ 24 } sm={ 8 }>
                        <Form.Item
                            name={ ['applicationData', 'reference', 'phone'] }
                            label="Phone (optional)"
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={ 24 } sm={ 8 }>
                        <Form.Item
                            name={ ['applicationData', 'reference', 'email'] }
                            label="Email (optional)"
                        >
                            <Input size="large" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col xs={ 24 } sm={ 8 }>
                        <Form.Item
                            name={ ['applicationData', 'reference', 'relationship'] }
                            label="Relationship"
                            rules={ [{ required: true, message: 'Required' }] }
                        >
                            <Input size="large" placeholder="e.g. Former Supervisor" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* 2. Emergency Contact Section */}
            <div style={ sectionStyle }>
                <div style={ { marginBottom: 32, textAlign: 'left' } }>
                    <Space size="middle" align="center">
                        <AlertOutlined style={ { ...titleIconStyle, display: 'inline-flex' } }/>
                        <Text strong style={ { fontSize: '20px', color: '#434343', lineHeight: 1 } }>
                            Emergency Contact(s)
                        </Text>
                    </Space>
                </div>

                <Form.List
                    name={ ['applicationData', 'emergencyContacts'] }
                    initialValue={ [{}] }
                >
                    { (fields, { add, remove }) => (
                        <>
                            { fields.map(({ key, name, ...restField }) => (
                                <div key={ key } style={ {
                                    marginBottom: 24,
                                    padding: '24px',
                                    background: isReadOnly ? '#f0f0f0' : '#fafafa',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    border: isReadOnly ? '1px solid #d9d9d9' : 'none'
                                } }>
                                    {/* 唯讀模式下不顯示刪除按鈕 */}
                                    { !isReadOnly && fields.length > 1 && (
                                        <DeleteOutlined
                                            onClick={ () => remove(name) }
                                            style={ {
                                                position: 'absolute',
                                                right: 20,
                                                top: 20,
                                                color: '#ff4d4f',
                                                fontSize: '18px',
                                                cursor: 'pointer'
                                            } }
                                        />
                                    ) }

                                    <Row gutter={ [16, 0] }>
                                        <Col xs={ 24 } sm={ 8 }>
                                            <Form.Item
                                                { ...restField }
                                                name={ [name, 'firstName'] }
                                                label="First Name"
                                                rules={ [{ required: true, message: 'Required' }] }
                                            >
                                                <Input size="large" disabled={isReadOnly} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={ 24 } sm={ 8 }>
                                            <Form.Item { ...restField } name={ [name, 'middleName'] }
                                                       label="Middle Name (optional)">
                                                <Input size="large" disabled={isReadOnly} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={ 24 } sm={ 8 }>
                                            <Form.Item
                                                { ...restField }
                                                name={ [name, 'lastName'] }
                                                label="Last Name"
                                                rules={ [{ required: true, message: 'Required' }] }
                                            >
                                                <Input size="large" disabled={isReadOnly} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={ [16, 0] }>
                                        <Col xs={ 24 } sm={ 8 }>
                                            <Form.Item
                                                { ...restField }
                                                name={ [name, 'phone'] }
                                                label="Phone (optional)"
                                            >
                                                <Input size="large" disabled={isReadOnly} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={ 24 } sm={ 8 }>
                                            <Form.Item
                                                { ...restField }
                                                name={ [name, 'email'] }
                                                label="Email (optional)"
                                            >
                                                <Input size="large" disabled={isReadOnly} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={ 24 } sm={ 8 }>
                                            <Form.Item
                                                { ...restField }
                                                name={ [name, 'relationship'] }
                                                label="Relationship"
                                                rules={ [{ required: true, message: 'Required' }] }
                                            >
                                                <Input size="large" disabled={isReadOnly} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            )) }

                            {/* 唯讀模式下隱藏「新增」按鈕 */}
                            { !isReadOnly && (
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={ () => add() }
                                        block
                                        icon={ <PlusOutlined/> }
                                        style={ { height: '50px', borderRadius: '8px' } }
                                    >
                                        Add Another Emergency Contact
                                    </Button>
                                </Form.Item>
                            ) }
                        </>
                    ) }
                </Form.List>
            </div>
        </>
    );
};

export default ReferenceForm;