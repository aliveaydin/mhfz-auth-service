TypeError: /app/src/nodeJs2/docs/object-design.ejs:20
18| This document outlines the object design for the `<%= dbObject.objectSettings.basicSettings.name %>` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.
19|

> > 20| <%- include(`${includePath}inc.object-design.ejs`, {dataObject:dbObject, service:serviceModel}); %>

/app/src/nodeJs2/docs/inc.object-design.ejs:401
399| These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.
400| <% filterProps.forEach(prop => { %>

> > 401| - **<%= prop.basicSettings.name %>**: <%= prop.basicSettings.type %> has a filter named `<%= prop.filterSettings.coconfigurationnfig.filterName || prop.basicSettings.name %>`

    402| <% }); -%>
    403| <% } -%>
    404|

Cannot read properties of undefined (reading 'filterName')
