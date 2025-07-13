/***
   int_grades__semester_gpas_merged.sql

   2024-12-05      Ana M        Created.
***/
{{
   config(
       tags=["grades", "gpa"]
   )
}}

with current_gpas as (
    select * from {{ ref('int_grades__current_semester_gpas_unpivoted') }}
)

, previous_gpas as (
    select * from {{ ref('int_grades__historical_semester_gpas_unpivoted') }}
)

, gpas as (
    select
        current_gpas.system_student_id
        , current_gpas.school_year_4_digit
        , current_gpas.gpa_term
        , current_gpas.gpa_type
        , current_gpas.gpa_value
        , current_gpas.potential_term_credits
        , current_gpas.grade_level_numeric_record
    from current_gpas
    union all
    select
        previous_gpas.system_student_id
        , previous_gpas.school_year_4_digit
        , previous_gpas.gpa_term
        , previous_gpas.gpa_type
        , previous_gpas.gpa_value
        , previous_gpas.potential_term_credits
        , previous_gpas.grade_level_numeric_record
    from previous_gpas
)

, final as (
    select 
        *
        ,rank()
            over (
                partition by gpas.system_student_id, gpas.gpa_type
                order by gpas.school_year_4_digit desc, gpas.gpa_term desc
        ) as gpa_rank -- Most recent GPA will have rank 1
    from gpas
)

select * from final
