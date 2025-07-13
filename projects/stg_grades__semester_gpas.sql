/***
    stg_grades__semester_gpas.sql

    2024-10-02      Ana M       Created.
***/
{{ 
    config(
        tags=["grades", "gpas"]
    ) 
}}

with source as (
    select * from {{ source('grades','semester_gpas') }}
)

, final as (
    select
        school_year_4_digit
        , cast(system_student_id as string) as system_student_id
        , weighted_s1 as gpa_weighted_semester_1
        , weighted_s2 as gpa_weighted_semester_2
        , unweighted_s1 as gpa_unweighted_semester_1
        , unweighted_s2 as gpa_unweighted_semester_2
    from source
)

select * from final
