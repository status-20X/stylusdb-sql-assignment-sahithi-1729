function parseQuery(query) {
    query = query.trim();
    let selectPart, fromPart;

    const whereSplit = query.split(/\sWHERE\s/i);
    query = whereSplit[0]; // Everything before WHERE clause

    
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

    
    const joinSplit = query.split(/\sINNER JOIN\s/i);
    selectPart = joinSplit[0].trim(); // Everything before JOIN clause

    
    const joinPart = joinSplit.length > 1 ? joinSplit[1].trim() : null;

    // Parse the SELECT part
    const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
    const selectMatch = selectPart.match(selectRegex);
    
    if (!selectMatch) {
        throw new Error('Invalid SELECT format');
    }

    const [, fields, table] = selectMatch;

    // Parse the JOIN part if it exists
    let joinTable = null, joinCondition = null, joinType=null;
    if (joinPart) {
        console.log("Join Part:", joinPart);
        queryjoinPart = 'INNER JOIN ' + joinPart;
        const joinInfo = parseJoinClause(queryjoinPart);
        joinTable = joinInfo.joinTable;
        joinCondition = joinInfo.joinCondition; 
        joinType = joinInfo.joinType;
    }

    // Parse the WHERE part if it exists
    let whereClauses = [];
    if (whereClause) {
        whereClauses = parseWhereClause(whereClause);
    }

    return {
        fields: fields.split(',').map(field => field.trim()),
        table: table.trim(),
        whereClauses,
        joinTable,
        joinCondition,
        joinType
    };
    
}


function parseJoinClause(query) {
    const joinRegex = /^(INNER|LEFT|RIGHT) JOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;

    const joinMatch = query.match(joinRegex);

    if (joinMatch) {
        // Extract the join type, table name, and join condition
        const joinTable = joinMatch[2].trim();
        const joinType = joinMatch[1].trim();
        const joinCondition = {
            left: joinMatch[3].trim(),
            right: joinMatch[4].trim()
        };

        return {
            joinTable,
            joinCondition,
            joinType
        };
    } else {
        console.log("No Join Match!"); // Log if no match found
        return {
            joinType: null,
            joinTable: null,
            joinCondition: null
        };
    }
}





// src/queryParser.js
function parseWhereClause(whereString) {
    const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/;
    return whereString.split(/ AND | OR /i).map(conditionString => {
        const match = conditionString.match(conditionRegex);
        if (match) {
            const [, field, operator, value] = match;
            return { field: field.trim(), operator, value: value.trim() };
        }
        throw new Error('Invalid WHERE clause format');
    });
}

module.exports = { parseQuery, parseJoinClause };