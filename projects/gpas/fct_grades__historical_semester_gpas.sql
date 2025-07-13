/***
   fct_grades__historical_semester_gpas.sql

   2024-12-05       Ana M       Created.
***/
{{
   config(
       tags=["grades", "gpa"]
   )
}}

with gpas as (
    select * from {{ ref('int_grades__semester_gpas_merged') }}
)

, final as (
    -- Single semester GPAs
    select
        gpas.system_student_id
        , gpas.school_year_4_digit
        , gpas.gpa_term
        , gpas.gpa_type
        , gpas.gpa_value
        , false as is_cumulative
        , if(gpas.gpa_rank = min(gpas.gpa_rank) over (partition by gpas.system_student_id), true, false)
            as is_most_recent
        , gpas.potential_term_credits
    from gpas
    union all
    -- Cumulative semester GPAs
    select
        gpas.system_student_id
        , gpas.school_year_4_digit
        , gpas.gpa_term
        , gpas.gpa_type
        , round(
            sum(gpas.gpa_value * gpas.potential_term_credits)
                over (
                    partition by system_student_id, gpa_type order by gpa_rank desc
                    rows between unbounded preceding and current row
                )
            / sum(gpas.potential_term_credits)
                over (
                    partition by system_student_id, gpa_type order by gpa_rank desc
                    rows between unbounded preceding and current row
                )
            , 2
        ) as gpa_value
        , true as is_cumulative
        , if(gpas.gpa_rank = min(gpas.gpa_rank) over (partition by gpas.system_student_id), true, false)
            as is_most_recent
        , sum(gpas.potential_term_credits) over (
            partition by system_student_id, gpa_type order by gpa_rank desc
            rows between unbounded preceding and current row
        ) as potential_term_credits
    from gpas
)

select * from final
