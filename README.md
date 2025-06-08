# Database Vertical Fragmentation Analysis Tool

A web-based tool for analyzing and performing vertical fragmentation of database relations. This tool helps database administrators and developers optimize their database design by suggesting optimal vertical fragmentation based on query patterns and access frequencies.

## Features

- Interactive web interface for inputting database schema and query information
- Automatic calculation of attribute usage matrix
- Generation of attribute affinity matrix
- Clustered attribute ordering with detailed steps
- Vertical fragmentation analysis with split quality calculations
- Best split recommendation with detailed explanation

## How to Use

1. Open `index.html` in a web browser
2. Enter the following information:
   - Relation Name: The name of your database relation
   - Attributes: Comma-separated list of attributes
   - Primary Key: The primary key of the relation
   - Number of Queries: Total number of queries to analyze
   - Number of Sites: Number of sites in your distributed database

3. For each query, provide:
   - Query Text: The SQL query or query pattern
   - Site Access Numbers: The access frequency for each site

4. Click "Analyze" to see the results

## Analysis Steps

The tool performs the following analysis:

1. **Attribute Usage Matrix**
   - Shows which attributes are used in each query
   - Binary matrix indicating attribute usage (1) or non-usage (0)

2. **Attribute Affinity Matrix**
   - Calculates the affinity between attributes based on query patterns
   - Considers site access frequencies in the calculations

3. **Clustered Attribute Ordering**
   - Shows detailed steps of the clustering algorithm
   - Displays the contribution calculations for each possible insertion
   - Provides the final clustered order of attributes

4. **Vertical Fragmentation Analysis**
   - Analyzes all possible split points
   - Calculates split quality for each possible fragmentation
   - Shows detailed calculations including:
     - acc(VF1): Sum of affinities within first fragment
     - acc(VF2): Sum of affinities within second fragment
     - acc(VF1,VF2): Sum of affinities between fragments
     - Split Quality (SQ): acc(VF1) * acc(VF2) - acc(VF1,VF2)^2

5. **Best Split Recommendation**
   - Shows the optimal vertical fragmentation
   - Includes both fragments with the primary key
   - Displays the maximum split quality achieved

## Example

Input:
```
Relation: PLAYER
Attributes: PID, Name, Team, Position, Age
Primary Key: PID
Queries: 4
Sites: 3
```

The tool will analyze the queries and their access patterns to suggest the optimal vertical fragmentation of the relation.

## Technical Details

- Built using HTML, CSS, and JavaScript
- No external dependencies required
- Client-side processing for immediate results
- Responsive design for various screen sizes

## File Structure

- `index.html`: Main interface and structure
- `styles.css`: Styling and layout
- `script.js`: Core logic and calculations

## Notes

- The tool requires at least two non-primary key attributes for clustering
- All calculations are performed in the browser
- Results are displayed in real-time
- The interface is designed to be intuitive and user-friendly

## Future Improvements

- Support for multiple relations
- More complex query pattern analysis
- Additional fragmentation strategies
- Export functionality for results
- Visualization of fragmentation results 