/***
    fct_kipp_forward__nsc_terms.sql

    2025-02-13      Ana M       Created.
    2025-07-28      Ana M       Adding exclude_nightly tag.
***/
{{ 
    config(
        tags=['kipp_forward', 'nsc', 'exclude_nightly']
    ) 
}}

with nsc_records as (
    select * from {{ ref('int_kipp_forward__nsc_records_ranked') }}
)

, graduations as (
    select * from {{ ref('int_kipp_forward__nsc_graduations_filtered_and_flattened') }}
)

-- First isolate one term record per student per institution per term (Spring/Summer/Fall + Year).
, terms as (
    select distinct
        nsc_records.local_term_id
        , nsc_records.local_enrollment_id
        , nsc_records.nsc_request_date
        , nsc_records.first_name
        , nsc_records.last_name
        , nsc_records.adb_salesforce_id
        , nsc_records.nsc_search_date
        , nsc_records.ipeds_id
        , nsc_records.two_or_four_year
        , nsc_records.public_or_private
        , nsc_records.first_enrollment_sequence
        , nsc_records.last_enrollment_sequence
    from nsc_records
)

/* Final CTE creates one term record per student per institution per term.
The unique term records are joined with the first term record and the last term record to get entry and exit info.
If graduation records exist, it is also joined to the final term record. */
, final as (
    select
        terms.local_enrollment_id
        , terms.local_term_id
        , first_term_record.first_college_sequence
        , terms.nsc_request_date
        , terms.first_name
        , terms.last_name
        , terms.adb_salesforce_id
        , terms.nsc_search_date
        , terms.ipeds_id
        /* The institution names can be different across terms like when attending online college at the same college,
        so default to version in first term (ipeds id is the same) */
        , first_term_record.institution_name
        , terms.two_or_four_year
        , terms.public_or_private
        , first_term_record.term_season
        , first_term_record.school_year_4_digit
        , first_term_record.entry_date
        , last_term_record.exit_date
        , last_term_record.enrollment_status
        , last_term_record.class_level
        , last_term_record.major_1
        , last_term_record.instructional_program_id_1
        , last_term_record.major_2
        , last_term_record.instructional_program_id_2
        , graduations.has_graduated
        , graduations.graduation_date
        , graduations.graduation_year
        , graduations.degree_major_1
        , graduations.degree_major_2
        , first_term_record.first_enrollment_sequence
        , last_term_record.last_enrollment_sequence
    from terms
    left join nsc_records as first_term_record
        on
            terms.local_term_id = first_term_record.local_term_id
            and first_term_record.first_term_sequence = 1
    left join nsc_records as last_term_record
        on
            terms.local_term_id = last_term_record.local_term_id
            and last_term_record.last_term_sequence = 1
    left join graduations
        on
            terms.local_enrollment_id = graduations.local_enrollment_id
            and terms.last_enrollment_sequence = 1
    order by
        terms.adb_salesforce_id
        , terms.ipeds_id
        , first_term_record.first_enrollment_sequence
)

select * from final
