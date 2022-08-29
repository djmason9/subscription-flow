# Axway Marketplace Subscription Approval Request Workflow using API Builder, Jira and MS Teams

This API Builder project implements the steps described [**here**](https://docs.axway.com/bundle/amplify-central/page/docs/integrate_with_central/webhook/marketplace_subscription_webhook/index.html) to approve Axway Marketplace subscription approval requests. It leverages Jira to file an incident with custom fields for approval and MS Teams to notify the approval team with links to the incident, product, subscription and subscriber:

![](https://i.imgur.com/rmP719m.png)

![](https://i.imgur.com/j0bsOcc.png)

![](https://i.imgur.com/ESvTR2H.png)

Here is an overview of the overall flow/process:

* A user subscribes to a Marketplace Product
* An Amplify Resource Webhook is fired and triggers an API Builder API
  * The API Builder API creates a Jira Incident with all pertinent information and links and instructions to the approver
  * The API Builder API also sends a message to MS Teams with pertinent information and a button/link to the Jira incident
* When the approver approves or rejects the request in the Jira Incident form and closes the incident a Jira webhook triggers another API Builder API
  * This API Builder API updates the Marketplace subscription request, adds a comment to the Jira Incident and sends a message to MS Teams indicating that the subscription request was processed

This is depicted in the data flow diagram below:

![](https://i.imgur.com/gXcSmw1.png)

The API Builder project exposes two API's:

* `POST /api/amplifycentralwebhookhandler` which takes an Amplify subscription webhook as the body. This is the webhook that Amplify calls when a marketplace product subscription request is made. The swagger for this method can be found in [**this**](https://github.com/lbrenman/amplifycentralwebhookhandlerdefinition) Stoplight Github repo.
* `POST /api/approver` which is called automatically when the approver select Approve or Reject button, adds a comment and closes the incident in Jira. The OpenAPI Specification document for this method can be found in [**this**](https://github.com/lbrenman/sl_marketplace_product_subscription_jira_approver_api_def) Stoplight Github repo.

You need to set the following environment variables:

```
CLIENT_ID=DOSA_<An Axway service account client ID>
CLIENT_SECRET=<An Axway service account client Secret>
API_KEY=<An API Key that you set>
API_CENTRAL_URL=https://apicentral.axway.com
MS_TEAMS_WEBHOOK_URL=<MS Teams channel incoming webhook URL>
BASEURL=<The base URL of your deployed API Builder project>
JIRA_URL=<Base address of your Jira Instance>
JIRA_PROJECT_KEY=<Your Jira Project Key>
JIRA_USERNAME=<Your Jira username>
JIRA_API_TOKEN=<Your Jira API Token>
JIRA_SUBS_APP_COMMENT_FIELD_NAME=<Your Jira custom field name for the Subscription Approval Comment field>
JIRA_SUBS_APP_PICKER_FIELD_NAME=<Your Jira custom field name for the Subscription Approval Picker field>
JIRA_SUBS_NAME_FIELD_NAME=<Your Jira custom field name for the Subscription Name field>
JIRA_SUBS_SELF_LINK_FIELD_NAME=<Your Jira custom field name for the Subscription Self Link field>
JIRA_ISSUE_TYPE=<Your desired Jira Issue Type>
```

For example:

```
CLIENT_ID=DOSA_bc.........56
CLIENT_SECRET=c872...........de8
API_KEY=92........755
MS_TEAMS_WEBHOOK_URL=https://axwaysoftware.webhook.office.com/webhookb2/bf..........7d/IncomingWebhook/04b.....1/5cf7......65e
API_CENTRAL_URL=https://apicentral.axway.com
BASEURL=https://c5......0.xxxxx.com
JIRA_URL=https://l.....an.atlassian.net/
JIRA_PROJECT_KEY=MSR
JIRA_USERNAME=l.....@gmail.com
JIRA_API_TOKEN=I...........8C
JIRA_SUBS_APP_COMMENT_FIELD_NAME=Subscription Approval Comment
JIRA_SUBS_APP_PICKER_FIELD_NAME=Subscription Approval Picker
JIRA_SUBS_NAME_FIELD_NAME=Subscription Name
JIRA_SUBS_SELF_LINK_FIELD_NAME=Subscription Self Link
JIRA_ISSUE_TYPE=Task
```

I configured my Marketplace Subscription Webhook as follows:

```
axway central create -f marketplaceapprovalworflowintegration.yaml
```

`marketplaceapprovalworflowintegration.yaml`

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

> Note that since Jora webhooks don't support authorization headers, I set the API Builder project to no authentication, so the API Key is currently not used or required

The API Builder flow for `/amplifycentralwebhookhandler` is shown below:

![](https://i.imgur.com/UjtPnjQ.png)

The API Builder flow for `/approver` is shown below:

![](https://i.imgur.com/7IXZCTD.png)

The flows can both certainly be improved by handling errors and other HTTP response status codes better but it demonstrates an MVP for now.


HEROKU
``` js
docker build -t subapproval ./

heroku git:remote -a subapproval

docker tag subapproval registry.heroku.com/subapproval/web

heroku container:login

docker push registry.heroku.com/subapproval/web

heroku container:release web
```