# Historical Semester GPAs Core Fact Model
### Summary
For this project, I used dbt to transform semester GPA data for our high school students to a core data model that shows all variations (unweighted/weighted, cumulative/non-cumulative) of GPAs for all students for each semester that they attended our high schools. KIPP NorCal frequently layers GPA data on top of other data such as assessment results or postsecondary enrollment outcomes, so it is really powerful for my data team to have these GPAs readily available in this core model in our data warehouse. Please note that I'm sharing a slightly simplified explanation of the model infrastructure. 

## Data Shape

**Original Data:** The GPAs sourced from PowerSchool (our Student Information System) are stored as separate fields, with a record for every student for every school year. The GPAs are non-cumulative from school year to school year. Below is an example for one student.<br><br>
<img width="2770" height="318" alt="image" src="https://github.com/user-attachments/assets/e264602f-801b-477e-8397-fb6d84e568a4" />
<br><br>
**Transformed Data:** The final model includes a record for every student, for every school year, and for every gpa variation. Below are all of the records available for this same student in the core model that I created.<br><br>
<img width="2318" height="1120" alt="image" src="https://github.com/user-attachments/assets/59000e0b-3e32-4ab5-9df5-045cf6124ff3" />


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
