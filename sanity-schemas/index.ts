import { siteSettingsType } from "./siteSettings";
import { planType } from "./plan";
import { faqType } from "./faq";

// Portal schemas
import { clientType } from "./client";
import { contentItemType } from "./contentItem";
import { revisionRequestType } from "./revisionRequest";

export const schema = {
  types: [
    siteSettingsType, 
    planType, 
    faqType, 
    clientType, 
    contentItemType, 
    revisionRequestType
  ],
};
