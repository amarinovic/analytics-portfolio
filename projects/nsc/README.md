# National Student Clearinghosuse Data Transformation
### Summary
For this project, I used dbt to clean and transform post-secondary institution enrollment records received from the National Student Clearinghouse (NSC) to the appropriate level of detail for upload to our internal Salesforce Alumni Database. 

## Data Shape

### Original Data
The enrollment records from NSC can include one or more records for each semester that a student is enrolled at a post-secondary institution. The records include start and end dates, enrollment statuses (full time/part time), class levels, degrees and majors pursued, etc. Many of our students attend more than one institution, for example if they transfer to a 4 year college after completing a 2 year college, so there are separate records for each institution as well. Finally, records that indicate graduation are included in the same dataset with different fields and values.<br><br>
Here is an example of all of the records received for one student. This student attended a 2 year college and graduated with an AA, before transferring to a 4 year college and graduating with a BA. There are 20 separate records for this student even though they only attended school for only 13 distinct terms.<br><br>
<img width="1926" height="631" alt="image" src="https://github.com/user-attachments/assets/c27be144-6aa0-44ae-8d80-a8cb25a56bfb" />
<br><br>
### Transformed Data
The result of my dbt SQL transformations is two models that are ready for upload to our internal Salesforce Alumni Database.<br><br>
**(1) A term level model** that includes a record for every term and institution where a student was enrolled. For the example student, this model includes 13 distinct term records.<br><br>
<img width="2314" height="529" alt="image" src="https://github.com/user-attachments/assets/9c481884-02b2-4f64-b8c8-30585fc9211a" />
<br><br>
**(2) An enrollment level model** that includes a record for every institution where a student was enrolled.. For the example student, this model includes 2 distinct institution enrollment records as well as the graduation details.<br><br>
<img width="2100" height="150" alt="image" src="https://github.com/user-attachments/assets/7c78c764-89ba-4b12-84cb-b60538ae17e8" />
<br><br>


## Data Models

| Model | Purpose |
| ----------- | ----------- |
| **[int_grades__potential_credits_by_term_pivoted](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/gpas/int_grades__potential_credits_by_term_pivoted.sql)** | This model pivots high school course credit values to use downstream when weighting semester GPAs. |
| **[int_grades__current_semester_gpas_unpivoted](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/gpas/int_grades__current_semester_gpas_unpivoted.sql)** | This model unpivots current school year GPAs so that there are separate records for weighted and unweighted GPAs. |
| **[int_grades__historical_semester_gpas_unpivoted](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/gpas/int_grades__historical_semester_gpas_unpivoted.sql)** | This model unpivots previous school year GPAs so that there are separate records for weighted and unweighted GPAs.  |
| **[int_grades__semester_gpas_merged](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/gpas/int_grades__semester_gpas_merged.sql)** | Because the current school year GPAs are sourced differently than past school year GPAs, this model unions the two GPA sources. |
| **[fct_grades__historical_semester_gpas.sql](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/gpas/fct_grades__historical_semester_gpas.sql)** | This is the final core model that includes a record for every student for every semester for every GPA variation. This model uses the term course credit values to calculate cumulative GPAs for each semester that a student is enrolled. |

**Lineage:**
<img width="3456" height="848" alt="image" src="https://github.com/user-attachments/assets/85af40b4-8764-4045-ad3e-07cfeccfc76d" />
