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

export interface S3PresignedUrlRequest {
    fileName: string;
    fileType: string;
}

const applicationService = {
    getApplication: async () => {
        const response = await axiosInstance.get('/auth/application');
        return response.data.data;
    },
    updateApplication: async (applicationData: applicationRequest) => {
        const response = await axiosInstance.put('/auth/application', applicationData);
        return response.data.data;
    },
    submitApplication: async (applicationData: applicationRequest) => {
        const response = await axiosInstance.post('/auth/application', applicationData);
        return response.data.data;
    },
    getS3PresignedUrl: async (props: S3PresignedUrlRequest) => {
        const response = await axiosInstance.get('/auth/upload-url', { params: props });
        return response.data.data;
    }
}

export default applicationService;
