/***
   int_grades__potential_credits_by_term_pivoted.sql

   2024-12-05      Ana M        Created.
***/
{{
   config(
       tags=["grades", "gpa"]
   )
}}

with grades as (
    select * from {{ ref('stg_ps__stored_grades') }}
)

, final as (
    select
        grades.system_student_id
        , grades.term_name as gpa_term
        , max(grades.grade_level_numeric) as grade_level_numeric_record
        , grades.school_year_4_digit
        , sum(grades.gpa_points) as gpa_points
        , sum(grades.gpa_added_value) as gpa_added_value
        , sum(grades.potential_credit_hours) as potential_term_credits
        , sum(grades.gpa_points * grades.potential_credit_hours)
        / nullif(sum(grades.potential_credit_hours), 0) as gpa_value_unweighted_internal_calculation
        , sum((grades.gpa_points + coalesce(grades.gpa_added_value,0)) * grades.potential_credit_hours)
        / nullif(sum(grades.potential_credit_hours), 0) as gpa_value_weighted_internal_calculation
    from grades
    where
        1 = 1
        and grades.is_excluded_from_gpa = false
        and grades.grade_level_numeric between 9 and 12
        and grades.term_name in ('S1', 'S2')
        and grades.school_year_4_digit >= 2018 -- Data prior to 17-18 should not be used due to data quality issues
    group by
        grades.system_student_id
        , grades.term_name
        , grades.school_year_4_digit
)

select * from final
