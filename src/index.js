const {parseQuery} = require('./queryParser');
const readCSV = require('./csvReader');

// Helper functions for different JOIN types
function performInnerJoin(data, joinData, joinCondition, fields, table) {
    const result = [];
    const joinConditionLeft = joinCondition.left.split('.').pop();
    const joinConditionRight = joinCondition.right.split('.').pop();
    
    for (const row1 of data) {
        for (const row2 of joinData) {
            if (row1[joinConditionLeft] === row2[joinConditionRight]) {
                const combinedRow = {};
                fields.forEach(field => {
                    combinedRow[field] = row1[field.split('.').pop()] || row2[field.split('.').pop()];
                });
                result.push(combinedRow);
            }
        }
    }
    return result;
}

function performLeftJoin(data, joinData, joinCondition, fields, table) {
    const result = [];
    const joinConditionLeft = joinCondition.left.split('.').pop();
    const joinConditionRight = joinCondition.right.split('.').pop();
    
    for (const row1 of data) {
        let matchFound = false;
        for (const row2 of joinData) {
            if (row1[joinConditionLeft] === row2[joinConditionRight]) {
                const combinedRow = {};
                fields.forEach(field => {
                    combinedRow[field] = row1[field.split('.').pop()] || row2[field.split('.').pop()];
                });
                result.push(combinedRow);
                matchFound = true;
            }
        }
        if (!matchFound) {
            const combinedRow = {};
            fields.forEach(field => {
                combinedRow[field] = row1[field.split('.').pop()] || null;
            });
            result.push(combinedRow);
        }
    }
    return result;
}

function performRightJoin(data, joinData, joinCondition, fields, table) {
    const result = [];
    const joinConditionLeft = joinCondition.left.split('.').pop();
    const joinConditionRight = joinCondition.right.split('.').pop();
    
    for (const row2 of joinData) {
        let matchFound = false;
        for (const row1 of data) {
            if (row1[joinConditionLeft] === row2[joinConditionRight]) {
                const combinedRow = {};
                fields.forEach(field => {
                    combinedRow[field] = row1[field.split('.').pop()] || row2[field.split('.').pop()];
                });
                result.push(combinedRow);
                matchFound = true;
            }
        }
        if (!matchFound) {
            const combinedRow = {};
            fields.forEach(field => {
                combinedRow[field] = row2[field.split('.').pop()] || null;
            });
            result.push(combinedRow);
        }
    }
    return result;
}


function evaluateCondition(row, clause) {
    const { field, operator, value } = clause;
    switch (operator) {
        case '=': return row[field] === value;
        case '!=': return row[field] !== value;
        case '>': return row[field] > value;
        case '<': return row[field] < value;
        case '>=': return row[field] >= value;
        case '<=': return row[field] <= value;
        default: throw new Error(`Unsupported operator: ${operator}`);
    }
}

async function executeSELECTQuery(query) {
    const { fields, table, whereClauses, joinTable, joinCondition,joinType} = parseQuery(query);
    let data = await readCSV(`${table}.csv`);

    if (joinTable && joinCondition) {
        const joinData = await readCSV(`${joinTable}.csv`);
        switch (joinType.toUpperCase()) {
            case 'INNER':
                data = performInnerJoin(data, joinData, joinCondition, fields, table);
                break;
            case 'LEFT':
                data = performLeftJoin(data, joinData, joinCondition, fields, table);
                break;
            case 'RIGHT':
                data = performRightJoin(data, joinData, joinCondition, fields, table);
                break;
        }
    }

    // Apply WHERE clause filtering
    const filteredData = whereClauses.length > 0
        ? data.filter(row => whereClauses.every(clause => evaluateCondition(row, clause)))
        : data;

    // Select the specified fields
    return filteredData.map(row => {
        const selectedRow = {};
        fields.forEach(field => {
            selectedRow[field] = row[field];
        });
        console.log(selectedRow)
        return selectedRow;
    });
}

module.exports = executeSELECTQuery;