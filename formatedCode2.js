async function code(data, logger) {
    let url = data.env.MS_TEAMS_WEBHOOK_URL;

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

    let resourceNm = resourceMap.AssetResource,
        resourceType = resourceMap.AssetRequestDefinition,
        requestName = data.request.body.payload.spec.product,
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

    let body = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "Marketplace Product Subscription Approval REQUESTED",
        "sections": [{
            "activityTitle": "Marketplace Product Subscription Approval REQUESTED",
            "activitySubtitle": "Please review and approve or reject the request from the Jira Incident",
            "markdown": true,
            "facts": [{
                "name": "Request",
                "value": "[" + requestName + "](" + ")"
            }, {
                "name": "Resource Name",
                "value": "[" + resourceNm + "](" + ")"
            }, {
                "name": "Resource Type",
                "value": "[" + resourceType + "](" + ")"
            }, {
                "name": "Subscription",
                "value": "[" + subscriptionName + "](" + subscriptionUrl + ")"
            }, {
                "name": "Requestor Name",
                "value": requestorName
            }, {
                "name": "Requestor Email",
                "value": "[" + requestorEmail + "](" + requestorEmailUrl + ")"
            }, {
                "name": "Organization",
                "value": "[" + orgName + "](" + orgUrl + ")"
            }, {
                "name": "Team",
                "value": "[" + teamName + "](" + teamUrl + ")"
            }],
        }],
        "potentialAction": [{
            "@type": "OpenUri",
            "name": "View Incident",
            "targets": [{
                "os": "default",
                "uri": data.env.JIRA_URL + '/browse/' + data.createIncidentResponse.body.key
            }]
        }]
    };

    return {
        url,
        body
    };
}