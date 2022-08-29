async function code(data, logger) {
    let metadata = data.request.body.payload.metadata;
    let refs = metadata.references;
    let appName = metadata.scope.name;

    let resourceMap = {
        "AssetName": "",
        "AssetResource": "",
        "AssetRequestDefinition": "",
        "Subscription": ""
    };

    refs.forEach(ref => {

        switch (ref.kind) {
            case "Asset":
                resourceMap.AssetName = ref.name;
                break;
            case "AssetResource":
                resourceMap.AssetResource = ref.name;
                break;
            case "AssetRequestDefinition":
                resourceMap.AssetRequestDefinition = ref.name;
                break;
            case "Subscription":
                resourceMap.Subscription = ref.name;
                break;
        }
    });

    let url = data.env.JIRA_URL + '/rest/api/2/issue';

    let requestName = resourceMap.AssetName,
        resourceNm = resourceMap.AssetResource,
        resourceType = resourceMap.AssetRequestDefinition,
        // productUrl = data.env.API_CENTRAL_URL + '/products/details/' + data.request.body.payload.spec.product,
        subscriptionName = resourceMap.Subscription,
        subscriptionUrl = data.env.API_CENTRAL_URL + '/marketplace/subscriptions',
        requestorName = data.getUserResponse.body.result.firstname + ' ' + data.getUserResponse.body.result.lastname,
        requestorEmail = data.getUserResponse.body.result.email,
        requestorEmailUrl = 'mailTo:' + data.getUserResponse.body.result.email,
        selfLink = data.env.API_CENTRAL_URL + '/apis' + data.request.body.payload.metadata.selfLink + '/approval',
        orgName = data.getOrgResponse.body.result.name,
        orgUrl = 'https://platform.axway.com/org/' + data.request.body.organization.id,
        teamName = data.getTeamResponse.body.result.name,
        teamUrl = 'https://platform.axway.com/org/team/' + data.request.body.payload.owner.id;


    // Jira custom fields
    let self_link_fieldname = data.getJiraFieldsFlowResponse.find(c => c.name === data.env.JIRA_SUBS_SELF_LINK_FIELD_NAME).key;
    let subs_name_fieldname = data.getJiraFieldsFlowResponse.find(c => c.name === data.env.JIRA_SUBS_NAME_FIELD_NAME).key;

    let description = `A marketplace access request has been made. Details are below:\r\r
      Subscription: ${subscriptionName} \r
      Subscription Link: ${subscriptionUrl} \r
      App Name: ${appName} \r
      Resource Name: ${resourceNm} \r
      Resource Type: ${resourceType} \r
      Request Name: ${requestName} \r
      Requestor: ${requestorName}\r
      Requestor E-mail: ${requestorEmailUrl} \r
      Organization: ${orgName} \r
      Organization Link: ${orgUrl}\r
      Team: ${teamName}\r
      Team Link: ${teamUrl}\r
      In order to approve or reject the access request, set the Approve/Reject field, add a comment/reason and close the incident.\r\r
      You can review the request here:\n ${subscriptionUrl} \n\n
      `;

    let body = {
        "fields": {
            "summary": "Marketplace product subscription approval request: " + subscriptionName,
            "issuetype": {
                "name": data.env.JIRA_ISSUE_TYPE
            },
            "project": {
                "key": data.env.JIRA_PROJECT_KEY
            },
            "description": description
        }
    };

    body.fields[self_link_fieldname] = selfLink;
    body.fields[subs_name_fieldname] = subscriptionName;

    return {
        url,
        body
    };
}