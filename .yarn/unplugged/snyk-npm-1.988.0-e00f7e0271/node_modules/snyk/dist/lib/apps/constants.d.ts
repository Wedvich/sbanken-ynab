export declare const SNYK_APP_NAME = "snykAppName";
export declare const SNYK_APP_REDIRECT_URIS = "snykAppRedirectUris";
export declare const SNYK_APP_SCOPES = "snykAppScopes";
export declare const SNYK_APP_CLIENT_ID = "snykAppClientId";
export declare const SNYK_APP_ORG_ID = "snykAppOrgId";
export declare const SNYK_APP_DEBUG = "snyk:apps";
export declare enum EValidSubCommands {
    CREATE = "create"
}
export declare enum EAppsURL {
    CREATE_APP = 0
}
export declare const validAppsSubCommands: string[];
export declare const AppsErrorMessages: {
    orgRequired: string;
    nameRequired: string;
    redirectUrisRequired: string;
    scopesRequired: string;
    useExperimental: string;
};
export declare const CreateAppPromptData: {
    SNYK_APP_NAME: {
        name: string;
        message: string;
    };
    SNYK_APP_REDIRECT_URIS: {
        name: string;
        message: string;
    };
    SNYK_APP_SCOPES: {
        name: string;
        message: string;
    };
    SNYK_APP_ORG_ID: {
        name: string;
        message: string;
    };
};
