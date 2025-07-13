/***
   int_grades__historical_semester_gpas_unpivoted.sql

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
            ref('stg_grades__semester_gpas')
            , cast_to='numeric'
            , exclude=['system_student_id','school_year_4_digit']
            , field_name='gpa_type'
            , value_name='gpa_value') 
    }}
)

, gpas as (
    select
        unpivoted_gpas.system_student_id
        , unpivoted_gpas.school_year_4_digit
        , if(unpivoted_gpas.gpa_type like '%unweighted%', 'Unweighted', 'Weighted') as gpa_type
        , if(unpivoted_gpas.gpa_type like '%1%', 'S1', 'S2') as gpa_term
        , unpivoted_gpas.gpa_value
    from unpivoted_gpas
    where
        1 = 1
        and unpivoted_gpas.gpa_value is not null
)

, final as (
    select
        gpas.system_student_id
        , gpas.school_year_4_digit
        , gpas.gpa_term
        , gpas.gpa_type
        , gpas.gpa_value
        , if (gpas.gpa_type = 'Weighted'
            , round(credits.gpa_value_weighted_internal_calculation,2)
            , round(credits.gpa_value_unweighted_internal_calculation,2)
        ) as gpa_value_internal_calculation
        , if (gpas.gpa_type = 'Weighted'
            , credits.gpa_value_weighted_internal_calculation
            , credits.gpa_value_unweighted_internal_calculation
        ) as gpa_value_internal_calculation_full
        , credits.gpa_points
        , credits.gpa_added_value
        , credits.potential_term_credits
        , credits.grade_level_numeric_record
    from gpas
    left join credits
        on
            gpas.system_student_id = credits.system_student_id
            and gpas.school_year_4_digit = credits.school_year_4_digit
            and gpas.gpa_term = credits.gpa_term
)

select * from final
