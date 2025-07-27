/***
    int_kipp_forward__nsc_graduations_filtered_and_flattened.sql

    2025-02-13      Ana M       Created by splitting a previous int model.
    2025-07-28      Ana M       Adding exclude_nightly tag.
***/
{{ 
    config(
        tags=['kipp_forward', 'nsc', 'exclude_nightly']
    ) 
}}

with nsc_records as (
    select * from {{ ref('int_kipp_forward__nsc_records_coded') }}
)

/* NSC sometimes includes multiple records for graduations at the same college for a variety of reasons.
This CTE flattens these cases into a single graduation record per student per institution. */
, final as (
    select
        nsc_records.local_enrollment_id
        , max(nsc_records.has_graduated) as has_graduated
        , max(nsc_records.graduation_date) as graduation_date
        , max(nsc_records.graduation_year) as graduation_year
        , string_agg(nsc_records.degree_major_1) as degree_major_1
        , string_agg(cast(nsc_records.degree_instructional_program_id_1 as string), ', ')
            as degree_instructional_program_id_1
        , string_agg(nsc_records.degree_major_2) as degree_major_2
        , string_agg(cast(nsc_records.degree_instructional_program_id_2 as string), ', ')
            as degree_instructional_program_id_2
    from nsc_records
    where
        1 = 1
        and nsc_records.has_graduated
    group by nsc_records.local_enrollment_id
)

select * from final
