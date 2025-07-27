/***
    int_kipp_forward__nsc_records_ranked.sql

    2025-01-23      Ana M       Created.
    2025-02-11      Ana M       Splitting int model functions.
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

, final as (
    select
        *
        -- Rank records within a term to get the first and last term record
        , dense_rank() over (
            partition by 
                nsc_records.local_enrollment_id
                , nsc_records.local_term_id
            order by 
                nsc_records.entry_date asc
                , nsc_records.exit_date asc
        ) as first_term_sequence
        , dense_rank() over (
            partition by 
                nsc_records.local_enrollment_id
                , nsc_records.local_term_id
            order by 
                nsc_records.entry_date desc
                , nsc_records.exit_date desc
        ) as last_term_sequence
        -- Rank records within an enrollment to get the first and last enrollment record
        , dense_rank() over (
            partition by nsc_records.local_enrollment_id
            order by 
                nsc_records.school_year_4_digit
                , case nsc_records.term_season
                    when 'Fall' then 1
                    when 'Spring' then 2
                    when 'Summer' then 3
                end
        ) as first_enrollment_sequence
        , dense_rank() over (
            partition by nsc_records.local_enrollment_id
            order by 
                nsc_records.school_year_4_digit desc
                , case nsc_records.term_season
                    when 'Fall' then 3
                    when 'Spring' then 2
                    when 'Summer' then 1
                end
        ) as last_enrollment_sequence
    from nsc_records
    where
        1 = 1
        -- The records that record graduations are separate from term records and hold different values.
        and nsc_records.has_graduated is false
)

select * from final
