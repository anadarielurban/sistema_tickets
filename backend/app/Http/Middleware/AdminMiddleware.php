public function handle($request, Closure $next)
{
    if (auth()->user() && auth()->user()->rol === 'admin') {
        return $next($request);
    }
    abort(403, 'Acceso no autorizado');
}