import axiosInstance from "../api/axiosInstance.ts";

export interface applicationRequest {
    userId: string;
    status: 'pending' | 'approved' | 'rejected'
    feedback?: string;
    applicationData: {
        firstName: string,
        lastName: string,
        middleName: string,
        preferredName: string,
        email: string,
        address: {
            street: string,
            buildingNumber: string,
            city: string,
            state: string,
            zipCode: string
        },
        phone: {
            mobile: string,
            work: string
        },
        personalInfo: {
            dateOfBirth: Date,
            gender: 'male' | 'female' | 'other' | 'prefer not to say',
            ssn: string
        },
        workAuthorization: {
            isCitizenOrPR: boolean,
            citizenType: string,
            workAuthType: string,
            otherVisaTitle: string,
            startDate: Date,
            endDate: Date
        },
        reference: {
            firstName: string,
            lastName: string,
            middleName: string,
            relationship: string,
            phone: string,
            email: string
        },
        emergencyContacts: [{
            firstName: string,
            lastName: string,
            middleName: string,
            relationship: string,
            phone: string,
            email: string
        }],
        documents: {
            profilePicture: {
                url: string,
                s3Key: string,
                uploadedAt: Date
            },
            workAuthorization: {
                url: string,
                s3Key: string,
                uploadedAt: Date
            },
            driverLicense: {
                url: string,
                s3Key: string,
                uploadedAt: Date
            }
        }
    }
}

const applicationService = {
    getApplication: async () => {
        const response = await axiosInstance.get('/application');
        return response.data.data;
    }
}

export default applicationService;