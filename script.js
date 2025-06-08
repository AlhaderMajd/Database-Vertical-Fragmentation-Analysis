document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('fragmentationForm');
    const queryCountInput = document.getElementById('queryCount');
    const siteCountInput = document.getElementById('siteCount');
    const queriesContainer = document.getElementById('queriesContainer');

    // Default data
    const defaultData = {
        relation: 'PLAYER',
        attributes: 'PID, Name, Team, Position, Age',
        primaryKey: 'PID',
        queryCount: 4,
        siteCount: 3,
        queries: [
            "SELECT Name, Position FROM PLAYER WHERE Age > 30",
            "SELECT Name, Age FROM PLAYER WHERE Team = 'A'",
            "SELECT Team, Position FROM PLAYER WHERE Age < 25",
            "SELECT Name, Team, Age FROM PLAYER"
        ],
        siteAccess: [
            [60, 0, 5],
            [0, 5, 7],
            [45, 0, 2],
            [35, 38, 13]
        ]
    };

    // Pre-fill the form with default data
    document.getElementById('relation').value = defaultData.relation;
    document.getElementById('attributes').value = defaultData.attributes;
    document.getElementById('primaryKey').value = defaultData.primaryKey;
    queryCountInput.value = defaultData.queryCount;
    siteCountInput.value = defaultData.siteCount;

    // Update query inputs when query count changes
    queryCountInput.addEventListener('change', updateQueryInputs);
    siteCountInput.addEventListener('change', updateQueryInputs);

    // Initial update of query inputs
    updateQueryInputs();

    // Pre-fill queries and site access
    setTimeout(() => {
        for (let i = 0; i < defaultData.queryCount; i++) {
            document.getElementById(`query${i}`).value = defaultData.queries[i];
            for (let j = 0; j < defaultData.siteCount; j++) {
                document.getElementById(`site${i}_${j}`).value = defaultData.siteAccess[i][j];
            }
        }
    }, 0);

    form.addEventListener('submit', handleSubmit);

    function updateQueryInputs() {
        const queryCount = parseInt(queryCountInput.value) || 0;
        const siteCount = parseInt(siteCountInput.value) || 0;
        
        queriesContainer.innerHTML = '';
        
        for (let i = 0; i < queryCount; i++) {
            const queryDiv = document.createElement('div');
            queryDiv.className = 'query-input';
            
            const queryLabel = document.createElement('label');
            queryLabel.textContent = `Query ${i + 1}:`;
            
            const queryInput = document.createElement('input');
            queryInput.type = 'text';
            queryInput.id = `query${i}`;
            queryInput.required = true;
            
            const siteAccessDiv = document.createElement('div');
            siteAccessDiv.className = 'site-access';
            
            for (let j = 0; j < siteCount; j++) {
                const siteInput = document.createElement('input');
                siteInput.type = 'number';
                siteInput.id = `site${i}_${j}`;
                siteInput.placeholder = `Site ${j + 1}`;
                siteInput.required = true;
                siteInput.min = 0;
                siteAccessDiv.appendChild(siteInput);
            }
            
            queryDiv.appendChild(queryLabel);
            queryDiv.appendChild(queryInput);
            queryDiv.appendChild(siteAccessDiv);
            queriesContainer.appendChild(queryDiv);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        // Get basic inputs
        const relation = document.getElementById('relation').value;
        const attributes = document.getElementById('attributes').value.split(',').map(attr => attr.trim());
        const primaryKey = document.getElementById('primaryKey').value.trim();
        const queryCount = parseInt(queryCountInput.value);
        const siteCount = parseInt(siteCountInput.value);

        // Validate inputs
        if (attributes.length < 3) {
            alert('At least two non-primary key attributes are required for clustering.');
            return;
        }

        // Get queries and site access
        const queries = [];
        const siteAccess = [];
        
        for (let i = 0; i < queryCount; i++) {
            queries.push(document.getElementById(`query${i}`).value);
            const siteRow = [];
            for (let j = 0; j < siteCount; j++) {
                siteRow.push(parseInt(document.getElementById(`site${i}_${j}`).value));
            }
            siteAccess.push(siteRow);
        }

        // Perform analysis
        const nonPkAttributes = attributes.filter(attr => attr !== primaryKey);
        const usageMatrix = createUsageMatrix(queries, nonPkAttributes);
        const affinityMatrix = createAffinityMatrix(usageMatrix, siteAccess);
        const clusteringResult = performClustering(affinityMatrix, nonPkAttributes);
        const bestSplit = findBestSplit(affinityMatrix, clusteringResult.order, primaryKey, nonPkAttributes);

        // Display results
        displayResults(usageMatrix, affinityMatrix, clusteringResult, bestSplit, nonPkAttributes);
    }

    function createUsageMatrix(queries, attributes) {
        const matrix = [];
        for (let i = 0; i < queries.length; i++) {
            const row = [];
            for (let j = 0; j < attributes.length; j++) {
                row.push(queries[i].includes(attributes[j]) ? 1 : 0);
            }
            matrix.push(row);
        }
        return matrix;
    }

    function createAffinityMatrix(usageMatrix, siteAccess) {
        const n = usageMatrix[0].length;
        const matrix = Array(n).fill().map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let q = 0; q < usageMatrix.length; q++) {
                    if (usageMatrix[q][i] && usageMatrix[q][j]) {
                        const totalAccess = siteAccess[q].reduce((a, b) => a + b, 0);
                        matrix[i][j] += totalAccess;
                    }
                }
            }
        }
        return matrix;
    }

    function performClustering(affinityMatrix, attributes) {
        const n = attributes.length;
        const order = [];
        const clustered = new Set();
        const steps = [];

        // Find initial pair with highest affinity
        let maxAffinity = -1;
        let first = 0, second = 1;
        
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (affinityMatrix[i][j] > maxAffinity) {
                    maxAffinity = affinityMatrix[i][j];
                    first = i;
                    second = j;
                }
            }
        }

        order.push(first, second);
        clustered.add(first);
        clustered.add(second);
        steps.push(`Initial pair: ${attributes[first]}, ${attributes[second]}`);

        // Add remaining attributes
        while (order.length < n) {
            let bestCont = -Infinity;
            let bestPos = -1;
            let nextAttr = -1;
            let stepDetails = [];

            // First, find the attribute with the best overall contribution
            for (let i = 0; i < n; i++) {
                if (!clustered.has(i)) {
                    let maxContForAttr = -Infinity;
                    let bestPosForAttr = -1;
                    let attrStepDetails = [];

                    attrStepDetails.push(`\nTrying to insert: ${attributes[i]}`);
                    
                    // Calculate contribution for each possible position
                    for (let pos = 0; pos <= order.length; pos++) {
                        let cont = 0;
                        let contDetails = '';
                        
                        if (pos === 0) {
                            cont = affinityMatrix[i][order[0]];
                            contDetails = `Position ${pos} (front): cont = bond(${attributes[i]}, ${attributes[order[0]]}) = ${cont}`;
                        } else if (pos === order.length) {
                            cont = affinityMatrix[order[order.length - 1]][i];
                            contDetails = `Position ${pos} (back): cont = bond(${attributes[order[order.length - 1]]}, ${attributes[i]}) = ${cont}`;
                        } else {
                            const left = order[pos - 1];
                            const right = order[pos];
                            cont = affinityMatrix[left][i] + affinityMatrix[i][right] - affinityMatrix[left][right];
                            contDetails = `Position ${pos}: cont(${attributes[left]}, ${attributes[i]}, ${attributes[right]}) = ${affinityMatrix[left][i]} + ${affinityMatrix[i][right]} - ${affinityMatrix[left][right]} = ${cont}`;
                        }
                        
                        attrStepDetails.push(contDetails);

                        if (cont > maxContForAttr) {
                            maxContForAttr = cont;
                            bestPosForAttr = pos;
                        }
                    }

                    // If this attribute has a better contribution than the current best
                    if (maxContForAttr > bestCont) {
                        bestCont = maxContForAttr;
                        bestPos = bestPosForAttr;
                        nextAttr = i;
                        stepDetails = attrStepDetails;
                    }
                }
            }

            // Insert the attribute with the best overall contribution
            order.splice(bestPos, 0, nextAttr);
            clustered.add(nextAttr);
            steps.push(stepDetails.join('\n'));
            steps.push(`=> Inserted ${attributes[nextAttr]} at position ${bestPos} (cont = ${bestCont})`);
        }

        return { order, steps };
    }

    function findBestSplit(affinityMatrix, order, primaryKey, attributes) {
        const n = attributes.length;
        let bestSplit = -1;
        let bestSq = -Infinity;
        const steps = [];

        for (let k = 1; k < n; k++) {
            const vf1 = order.slice(0, k);
            const vf2 = order.slice(k);

            let acc1 = 0, acc2 = 0, acc12 = 0;

            // Calculate acc1
            for (let i of vf1) {
                for (let j of vf1) {
                    acc1 += affinityMatrix[i][j];
                }
            }

            // Calculate acc2
            for (let i of vf2) {
                for (let j of vf2) {
                    acc2 += affinityMatrix[i][j];
                }
            }

            // Calculate acc12
            for (let i of vf1) {
                for (let j of vf2) {
                    acc12 += affinityMatrix[i][j];
                }
            }

            const sq = acc1 * acc2 - acc12 * acc12;

            steps.push(`
Split at position ${k}:
VF1 = { ${primaryKey}${vf1.map(i => ', ' + attributes[i]).join('')} }
VF2 = { ${primaryKey}${vf2.map(i => ', ' + attributes[i]).join('')} }
acc(VF1) = ${acc1}, acc(VF2) = ${acc2}, acc(VF1,VF2) = ${acc12}
sq = ${acc1} * ${acc2} - ${acc12}^2 = ${sq}
            `);

            if (sq > bestSq) {
                bestSq = sq;
                bestSplit = k;
            }
        }

        return {
            split: bestSplit,
            quality: bestSq,
            vf1: order.slice(0, bestSplit),
            vf2: order.slice(bestSplit),
            steps: steps
        };
    }

    function displayResults(usageMatrix, affinityMatrix, clusteringResult, bestSplit, attributes) {
        // Get the primary key value
        const primaryKeyValue = document.getElementById('primaryKey').value;

        // Display Usage Matrix
        const usageMatrixDiv = document.getElementById('usageMatrix');
        let usageHtml = '<table><tr><th></th>';
        attributes.forEach(attr => {
            usageHtml += `<th>${attr}</th>`;
        });
        usageHtml += '</tr>';

        for (let i = 0; i < usageMatrix.length; i++) {
            usageHtml += `<tr><td>Q${i + 1}</td>`;
            for (let j = 0; j < usageMatrix[i].length; j++) {
                usageHtml += `<td>${usageMatrix[i][j]}</td>`;
            }
            usageHtml += '</tr>';
        }
        usageHtml += '</table>';
        usageMatrixDiv.innerHTML = usageHtml;

        // Display Affinity Matrix
        const affinityMatrixDiv = document.getElementById('affinityMatrix');
        let affinityHtml = '<table><tr><th></th>';
        attributes.forEach(attr => {
            affinityHtml += `<th>${attr}</th>`;
        });
        affinityHtml += '</tr>';

        for (let i = 0; i < affinityMatrix.length; i++) {
            affinityHtml += `<tr><td>${attributes[i]}</td>`;
            for (let j = 0; j < affinityMatrix[i].length; j++) {
                affinityHtml += `<td>${affinityMatrix[i][j]}</td>`;
            }
            affinityHtml += '</tr>';
        }
        affinityHtml += '</table>';
        affinityMatrixDiv.innerHTML = affinityHtml;

        // Display Clustered Order with detailed steps
        const clusteringStepsDiv = document.getElementById('clusteringSteps');
        clusteringStepsDiv.innerHTML = `
            <h3>Clustering Steps:</h3>
            <pre>${clusteringResult.steps.join('\n')}</pre>
            <h3>Final Clustered Order:</h3>
            <p>${clusteringResult.order.map(i => attributes[i]).join(' → ')}</p>
            
            <h3>Reordered Affinity Matrix:</h3>
            <table>
                <tr>
                    <th></th>
                    ${clusteringResult.order.map(i => `<th>${attributes[i]}</th>`).join('')}
                </tr>
                ${clusteringResult.order.map(i => `
                    <tr>
                        <td>${attributes[i]}</td>
                        ${clusteringResult.order.map(j => `<td>${affinityMatrix[i][j]}</td>`).join('')}
                    </tr>
                `).join('')}
            </table>
        `;

        // Display Vertical Fragmentation Analysis
        const fragmentationAnalysisDiv = document.getElementById('fragmentationAnalysis');
        fragmentationAnalysisDiv.innerHTML = `
            <h3>Vertical Fragmentation Analysis:</h3>
            <pre>${bestSplit.steps.join('\n')}</pre>
        `;

        // Display Best Split
        const bestSplitDiv = document.getElementById('bestSplit');
        const vf1 = bestSplit.vf1.map(i => attributes[i]);
        const vf2 = bestSplit.vf2.map(i => attributes[i]);
        
        bestSplitDiv.innerHTML = `
            <h3>Best Split (Maximum SQ):</h3>
            <p>VF1: {${primaryKeyValue}, ${vf1.join(', ')}}</p>
            <p>VF2: {${primaryKeyValue}, ${vf2.join(', ')}}</p>
            <p>Split Quality = ${bestSplit.quality}</p>
        `;
    }
}); 