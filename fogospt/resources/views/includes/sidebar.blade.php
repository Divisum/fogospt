@isset($fire)
    <div class="sidebar active">
@endisset

@empty($fire)
    <div class="sidebar">
@endempty

@include('elements.cards.general')
@include('elements.cards.resources')
@include('elements.cards.extra')
@include('elements.cards.status')
@include('elements.cards.shares')
@include('elements.cards.meteo')
@include('elements.cards.twitter')
</div>