TypeError: /app/src/nodeJs2/docs/auth-design.ejs:699
697| <% if (service.dataObjects && service.dataObjects.length > 0) { %>
698| <% service.dataObjects.forEach(dataObject => { %>

> > 699| <%- include(`${includePath}inc.object-design.ejs`, {dataObject:dataObject,service:service}); %>

    700| <% }); %>
    701| <% } %>
    702|

/app/src/nodeJs2/docs/inc.object-design.ejs:401
399| These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.
400| <% filterProps.forEach(prop => { %>

> > 401| - **<%= prop.basicSettings.name %>**: <%= prop.basicSettings.type %> has a filter named `<%= prop.filterSettings.coconfigurationnfig.filterName || prop.basicSettings.name %>`

    402| <% }); -%>
    403| <% } -%>
    404|

Cannot read properties of undefined (reading 'filterName')
