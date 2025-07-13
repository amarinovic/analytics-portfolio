/***
   int_grades__current_semester_gpas_unpivoted.sql

   2024-12-05      Ana M        Created.
***/
{{
   config(
       tags=["grades", "gpa"]
   )
}}

with credits as (
    select * from {{ ref('int_grades__potential_credits_by_term_pivoted') }}
)

, unpivoted_gpas as (
    {{ 
        dbt_utils.unpivot(
            ref('stg_ps__current_gpas')
            , cast_to='numeric'
            , exclude=['system_student_id']
            , field_name='gpa_type'
            , value_name='gpa_value') 
    }}
)

, gpas as (
    select
        unpivoted_gpas.system_student_id
        , {{ school_year_4_digit(dbt_date.today()) }} as school_year_4_digit
        , if(unpivoted_gpas.gpa_type like '%unweighted%', 'Unweighted', 'Weighted') as gpa_type
        , if(unpivoted_gpas.gpa_type like '%1%', 'S1', 'S2') as gpa_term
        , unpivoted_gpas.gpa_value
    from unpivoted_gpas
    where
        1 = 1
        and unpivoted_gpas.gpa_value is not null
        and unpivoted_gpas.gpa_type like '%semester%'
)

, final as (
    select
        gpas.system_student_id
        , gpas.school_year_4_digit
        , gpas.gpa_term
        , gpas.gpa_type
        , gpas.gpa_value
        , credits.potential_term_credits
        , credits.grade_level_numeric_record
    from gpas
    left join credits
        on
            gpas.system_student_id = credits.system_student_id
            and gpas.gpa_term = credits.gpa_term
            and credits.school_year_4_digit = {{ school_year_4_digit(dbt_date.today()) }}
)

select * from final
