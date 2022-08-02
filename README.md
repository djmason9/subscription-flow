# Axway Marketplace Subscription Approval Request Workflow using API Builder, MS Teams and Jira

This API Builder project implements the steps described [**here**](https://docs.axway.com/bundle/amplify-central/page/docs/integrate_with_central/webhook/marketplace_subscription_webhook/index.html) to approve Axway Marketplace subscription approval requests. It leverages Jira to present an approval form to the approver:

![](https://i.imgur.com/1Yc098u.png)

Note that custom fields are added to Jira to aid in the approval process:

* *approve*/*reject* picker (for user input)
* comments (for user input)
* subscription name (for internal use)
* subscription link (for internal use)

Note that we are creating an incident of type "Demand". This is a custom type for demonstration purposes.

We also leverage MS Teams to notify the approval team:

![](https://i.imgur.com/nZD5CKd.png)

The API Builder project exposes two API's:

* `POST /api/amplifycentralwebhookhandler` which takes an Amplify subscription webhook as the body. This is the webhook that Amplify calls when a marketplace product subscription request is made.
* `POST /api/approver` which is called when the Jira incident is updated. Note that a jira webhook must be configured for this:

![](https://i.imgur.com/UXaf2nk.png)

You need to set the following environment variables:

```
CLIENT_ID=DOSA_<An Axway service account client ID>
CLIENT_SECRET=<An Axway service account client Secret>
API_KEY=<An API Key that you set>
API_CENTRAL_URL=https://apicentral.axway.com
BASEURL=https://c560-73-227-43-40.ngrok.io
JIRA_URL=<Your Jira instance base URL>
JIRA_PROJECT_KEY=<Your Jira Project Key>
JIRA_USERNAME=<Your Jira Username>
JIRA_API_TOKEN=<Your Jira API Token>
MS_TEAMS_WEBHOOK_URL=<MS Teams channel incoming webhook URL>
BASEURL=<The base URL of your deployed API Builder project>
```

I configured my Marketplace Subscription Webhook as follows:

```
axway central create -f marketplace.yaml
```

`marketplace.yaml`

```
group: management
apiVersion: v1alpha1
kind: Integration
title: Integrations for Marketplace Subscription Approvals
name: integrations-for-subscription-approvals
spec:
  description: This is a group of resources to be used for marketplace subscription approval workflows
---
group: management
apiVersion: v1alpha1
kind: Webhook
title: Webhook Listener for Marketplace Subscription Approvals
name: wh-integrations-for-subscription-approvals
metadata:
  scope:
    kind: Integration
    name: integrations-for-subscription-approvals
spec:
  enabled: true
  url: <API Builder Base Address>/api/amplifycentralwebhookhandler
  headers:
      apikey: <API Key Set as Env Var>
      Content-Type: application/json
---
group: management
apiVersion: v1alpha1
kind: ResourceHook
title: Resource Hook for Marketplace Subscription Approvals
name: rh-integrations-for-subscription-approvals
metadata:
  scope:
    kind: Integration
    name: integrations-for-subscription-approvals
spec:
  triggers:
    - group: catalog
      kind: Subscription
      name: "*"
      type:
      - updated
  webhooks:
    - wh-integrations-for-subscription-approvals
```

> Note: You need to edit the YAML file above and set the API Builder base address and APIKey in the webhook section

The API Builder flow for `/amplifycentralwebhookhandler` is shown below:

![](https://i.imgur.com/AqNc8kw.png)

The API Builder flow for `/approver` is shown below:

![](https://i.imgur.com/JqesRQv.png)

The flows can both certainly be improved by handling errors and other HTTP response status codes better but it demonstrates an MVP for now.


`axway auth login --client-id demo-service_3ba9c5d5-cb5b-47f6-909f-174ecc6b7099 --client-secret c3c6c0b3-bbcb-438b-8c88-f83b424e523c`
