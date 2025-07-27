# National Student Clearinghouse Data Transformation
### Summary
For this project, I used dbt to clean and transform post-secondary institution enrollment records received from the National Student Clearinghouse (NSC) to the appropriate level of detail for upload to our internal Salesforce Alumni Database. 

## Data Shape

### Original Data
The enrollment records from NSC can include one or more records for each semester that a student is enrolled at a post-secondary institution. The records include start and end dates, enrollment statuses (full time/part time), class levels, degrees and majors pursued, etc. Many of our students attend more than one institution, for example if they transfer to a 4 year college after completing a 2 year college, so there are separate records for each institution as well. Finally, records that indicate graduation are included in the same dataset with different fields and values.<br><br>
Here is an example of all of the records received for one student. This student attended a 2 year college and graduated with an AA, before transferring to a 4 year college and graduating with a BA. There are 20 separate records for this student even though they attended for only 13 distinct terms.<br><br>
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
| **[stg_kf__nsc_returned_records](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/nsc/stg_kf__nsc_returned_records.sql)** | This is the staging model where I apply base transformations to the raw data. |
| **[int_kipp_forward__nsc_records_deduped](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/nsc/int_kipp_forward__nsc_records_deduped.sql)** | This model removes duplicate records to only include the most up to date records for each student. |
| **[int_kipp_forward__nsc_records_coded](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/nsc/int_kipp_forward__nsc_records_coded.sql)** | This model maps NSC field values to the field values our Salesforce data expects for upload. |
| **[int_kipp_forward__nsc_records_ranked](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/nsc/int_kipp_forward__nsc_records_ranked.sql)** | This model isolates enrollment records and applies an intra-term ranking as well as an intra-institutional-enrollment ranking to each record. |
| **[int_kipp_forward__nsc_graduations_filtered_and_flattened](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/nsc/int_kipp_forward__nsc_graduations_filtered_and_flattened.sql)** | This model isolates records with graduation details and flattens the records to one record per student institutional enrollment. |
| **[fct_kipp_forward__nsc_terms](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/nsc/fct_kipp_forward__nsc_terms.sql)**| This model combines the previous two models to output a distinct record for each term that a student attends at each institution, including graduation details on the final term. |
| **[fct_kipp_forward__nsc_enrollments](https://github.com/amarinovic/analytics-portfolio/blob/main/projects/nsc/fct_kipp_forward__nsc_enrollments.sql)**| This model combines the same two models to output a distinct record for each institution that a student attends, including graduation details. |
**Lineage:**
<img width="3516" height="372" alt="image" src="https://github.com/user-attachments/assets/02cd9f2f-dc41-4147-bff7-251344e4b4f0" />

