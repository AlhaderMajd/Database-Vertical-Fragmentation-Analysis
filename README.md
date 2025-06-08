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

Here's a complete example of how to use the tool:

### Input Data
```
Relation Name: Player
Attributes (comma-separated): Name, Height, Gender, Address, Weight, DOB, Telephone
Primary Key: Name
Number of Queries: 4
Number of Sites: 3

Query 1: SELECT Name, DOB, Address, Telephone FROM Player WHERE Gender = value;
Site Access: [60, 0, 45]

Query 2: SELECT Avg (Height), Avg (Weight) FROM Player WHERE Gender = value;
Site Access: [0, 5, 0]

Query 3: SELECT Name, Height, Weight, DOB FROM Player WHERE Name LIKE value;
Site Access: [5, 7, 2]

Query 4: SELECT Name, Address, Telephone FROM Player WHERE Name = value;
Site Access: [35, 38, 13]
```

### Analysis Results
The tool will analyze these queries and their access patterns to:
1. Create an attribute usage matrix showing which attributes are used in each query
2. Generate an affinity matrix based on query patterns and site access frequencies
3. Perform clustered attribute ordering to find the optimal arrangement
4. Calculate split quality for all possible fragmentations
5. Recommend the best vertical fragmentation with the highest split quality

### Expected Output
The tool will show:
- Detailed attribute usage matrix
- Complete affinity matrix
- Step-by-step clustering process
- All possible fragmentation options with their quality measures
- The optimal vertical fragmentation that maximizes split quality

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
- The example data is pre-loaded in the tool for quick testing