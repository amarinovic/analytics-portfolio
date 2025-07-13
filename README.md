# Ana Marinovic - Work Samples
[LinkedIn Profile](https://www.linkedin.com/in/anapaulamarinovic/) | anapmarinovic@gmail.com

## Contents
1. [dbt SQL models for BigQuery](#sql)
2. [Tableau](#tableau)
3. [d3.js](#d3)

## dbt SQL models for BigQuery <a name='sql'></a>
In my current role as the Associate Director of Analytics Engineering at KIPP Public Schools NorCal, one of my primary responsibilities is to build Tableau dashboards to support progress monitoring to goals for partner team initiatives. KIPP NorCal relies heavily on data to inform regional priorities and strategies, and there are strong goal-setting practices throughout the organization. As I partner with teams, I engage in thorough discovery work to understand their data-tracking needs, and then I design and build Tableau dashboards, as well as the underlying SQL data models, that allow the teams to easily track progress to all of their goals. I am not able to share the Tableau workbooks directly because of data privacy concerns, but the PDF screenshots I included below can give a rough idea of some of the data tools I build in my current role.
<br>
| Project | Link | Description |
| ----------- | ----------- |  ----------- |
| **National Student Clearinghouse** | [Link]| Text Text Text |
| **High School GPA** | [Link] | Text Text Text |
| **High Health** | [Link]| Text Text Text |


## Tableau <a name='tableau'></a>
In my current role as the Associate Director of Analytics Engineering at KIPP Public Schools NorCal, one of my primary responsibilities is to build Tableau dashboards to support progress monitoring to goals for partner team initiatives. KIPP NorCal relies heavily on data to inform regional priorities and strategies, and there are strong goal-setting practices throughout the organization. As I partner with teams, I engage in thorough discovery work to understand their data-tracking needs, and then I design and build Tableau dashboards, as well as the underlying SQL data models, that allow the teams to easily track progress to all of their goals.
<br><br>
I am not able to share the Tableau workbooks directly because of data privacy concerns, but the PDF screenshots I included below can give a rough idea of some of the data tools I build in my current role. I redacted some identifying information. Each of the reports has filter and parameter options as well as tooltips that of course don't come through in the PDF format. 
<br>
| Project | Link | Description |
| ----------- | ----------- |  ----------- |
| **Instructional Talent Dashboard** | [PDF](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/Instructional%20Talent%20Dashboard.pdf)| I designed and built this report to support both our talent team and our organization's senior leaders with progress monitoring toward hiring for instructional positions at our schools. The talent team has a number of KPIs that guide their efforts, and this report summarizes these metrics and provides school level details as well. The underlying data lives in a series of Google Sheet trackers, so once the data was brought into our data warehouse, I built SQL models to reshape the data for the report. |
| **Alumni Success Metrics** | [PDF](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/Alumni%20Success%20Metrics.pdf) | A key focus of the KIPP charter school network is alumni success, and in the first tab of this report I summarized the alumni success KPIs our region tracks, such as college enrollment, persistence, and graduation. In addition to the college counseling and postsecondary advising teams, our marketing and development teams frequently use this report to pull data points to include in grant applications for our region. The second tab of this report is an example of an analysis I designed and built to support our college counseling team with understanding how successful our alumni are at specific institutions in order to inform their team's strategy. I am the systems administrator for the NorCal region for the Salesforce database where we keep the alumni postsecondary enrollment and outcome data, and I use Fivetran to bring the data into our BigQuery data warehouse. Using dbt, I have built a robust infrastructure of reusable SQL models from this Salesforce data, and I build on top of these core models to transform the data into the correct shape for reports like these. |
| **High School Postseconday Match Progress Monitoring Dashboard** | [PDF](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/High%20School%20PS%20Match%20Progress%20Monitoring%20Dashboard.pdf)| I built this report to support the very detailed progress monitoring that our high school college counseling team engages in to track high school junior and senior class postsecondary application steps. The team sets a variety of goals for each step of the college application process, and this report summarizes the current state for each step. This report includes a lot of filter and parameter options, making the data analysis very "self-serve" for the college counseling team. The underlying data lives in a series of Google Sheet trackers as well as in the online application Overgrad, and I have built SQL models to combine and transform the data for this report. |

## d3.js <a name='d3'></a>
These samples are less recent, but I'm including them because d3.js was my portal to the world of analytics engineering. I fell in love with d3.js because it allowed me to be artsy and mathy and so very detailed all at once. I've come to terms with the impractical limits of building d3.js tools for the Data & Analytics teams that I've been a part of to date, but I will always hold a special place in my heart for the infinite customizability of d3.js. These visualizations may suffer from browser compatibility issues because of the time that has passed since I built them; please view these in Google Chrome.  
<br>
| Project | Link | Description |
| ----------- | ----------- |  ----------- |
| **Literacy in Dallas County** | [Visualization](https://amarinovic.github.io/analytics-portfolio/projects/earlyliteracy/index.html) | Only 36% of Dallas County 3rd grade students were reading proficiently in 2015, but a number of national studies identified 3rd grade reading proficiency as a key factor in determining the likelihood of a student's graduation from high school. This interactive visualization illustrates the impact of 3rd grade reading proficiency on Dallas County high school graduation rates and consequent lost earnings to the region. I created this visualization during a summer internship. |
| **National Assessment of Education Progress Trends** | [Visualization](https://amarinovic.github.io/analytics-portfolio/projects/naep/index.html)| The National Assessment of Educational Progress (NAEP) is the largest nationally representative and continuing assessment of what America's students know and can do in various academic subjects. I created this visualization on my own time to explore trends in 4th and 8th grade reading and mathematics scores. Comparisons can be made over time, between states and cities, and among subgroups. |
